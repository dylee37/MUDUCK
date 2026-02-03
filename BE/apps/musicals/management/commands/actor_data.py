# apps/musicals/management/commands/actor_data.py

# 1. KOPIS 상세 API 호출: kopis_id를 이용해 상세 정보를 받아옵니다.
# 2. 이름 리스트 확보: <prfcast> 태그에서 "조승우, 홍광호" 같은 텍스트를 쉼표로 자릅니다.
# 3. PlayDB 크롤링: 각 이름으로 PlayDB를 검색해 **source_id**와 **profile_img**를 가져옵니다.
# 4. Actor 객체 생성: get_or_create(source_id=...)를 통해 배우를 만듭니다.
# 5. Musical-Actor 연결: musical.actors.add(actor)를 실행해 관계를 맺어줍니다

import os
import re
import time
import requests
import urllib.parse
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from apps.musicals.models import Musical, Actor
from dotenv import load_dotenv

load_dotenv()

class Command(BaseCommand):
    help = 'KOPIS 배우 리스트를 기반으로 PlayDB 상세 정보를 1:1 매칭합니다.'

    def handle(self, *args, **options):
        KOPIS_API_KEY = os.getenv('KOPIS_API')
        musicals = Musical.objects.all()

        for musical in musicals:
            self.stdout.write(f"\n>>> [{musical.title}] 데이터 수집 중...")
            
            # 1. KOPIS 상세 정보 가져오기
            kopis_url = f"http://www.kopis.or.kr/openApi/restful/pblprfr/{musical.kopis_id}?service={KOPIS_API_KEY}"
            try:
                res = requests.get(kopis_url)
                tree = ET.fromstring(res.content)
                prfcast = tree.find('.//prfcast').text if tree.find('.//prfcast') is not None else ""
                
                if not prfcast or prfcast.strip() == "":
                    continue

                # 2. 배우 이름 리스트 정제 (중복 제거 및 '등', '외' 제거)
                names = list(set([re.sub(r'\s*(등|외|및|외\s*\d+명).*$', '', n).strip() for n in prfcast.split(',')]))

                for name in names:
                    if not name: continue
                    
                    # 3. PlayDB 검색 및 크롤링
                    actor_info = self.get_playdb_actor(name)
                    
                    if actor_info:
                        # Actor 생성 또는 업데이트
                        actor, _ = Actor.objects.update_or_create(
                            source_id=actor_info['source_id'],
                            defaults={
                                'name': name,
                                'profile_img': actor_info['profile_img'],
                                'external_link': actor_info['external_link']
                            }
                        )
                        # 4. Musical과 연결
                        musical.actors.add(actor)
                        self.stdout.write(f"   - {name} 연결 완료 (ID: {actor_info['source_id']})")
                    else:
                        # PlayDB에 없더라도 이름은 저장 (선택 사항)
                        actor, _ = Actor.objects.get_or_create(name=name)
                        musical.actors.add(actor)
                        self.stdout.write(f"   - {name} (PlayDB 결과 없음 - 이름만 연결)")

                time.sleep(0.3) # 서버 부하 방지
            except Exception as e:
                self.stdout.write(f"Error: {musical.title} - {e}")

    def get_playdb_actor(self, name):
        clean_name = re.sub(r'\s*(등|외|및|외\s*\d+명).*$', '', name).strip()
        if not clean_name: return None

        # 1. 검색창 대신 '인물 리스트' 페이지를 직접 공략 (EUC-KR 인코딩 필수)
        encoded_name = urllib.parse.quote(clean_name.encode('euc-kr'))
        list_url = f"http://www.playdb.co.kr/artistdb/list.asp?code=013003&search_type=nm&search_word={encoded_name}"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'http://www.playdb.co.kr/artistdb/main.asp'
        }

        try:
            res = requests.get(list_url, headers=headers, timeout=10)
            res.encoding = 'euc-kr'
            soup = BeautifulSoup(res.text, 'html.parser')

            # 2. 리스트에서 정확히 해당 배우의 ManNo 추출
            # PlayDB 리스트의 <a> 태그에서 ManNo=... 링크를 찾습니다.
            link = soup.find('a', href=re.compile(r'ManNo=(\d+)'))
            
            if not link:
                return None

            man_no = re.search(r'ManNo=(\d+)', link['href']).group(1)
            detail_url = f"http://www.playdb.co.kr/artistdb/detail.asp?ManNo={man_no}"

            # 3. 상세 페이지에서 프로필과 필모그래피 추출
            time.sleep(0.3)
            d_res = requests.get(detail_url, headers=headers)
            d_res.encoding = 'euc-kr'
            d_soup = BeautifulSoup(d_res.text, 'html.parser')

            # 프로필 이미지
            img_tag = d_soup.select_one('#root_img')
            profile_img = img_tag['src'] if img_tag else ""

            # 출연작(Filmography) - '출연작품' 테이블 파싱
            # 보통 상세페이지 하단에 리스트 형태로 존재합니다.
            filmo = []
            filmo_links = d_soup.select('a[href*="/playdb/playdbDetail.asp"]')
            for f in filmo_links[:10]: # 최근 10개만 예시로 수집
                title = f.text.strip()
                if title and title not in filmo:
                    filmo.append(title)

            return {
                'source_id': man_no,
                'profile_img': profile_img,
                'external_link': detail_url,
                'filmo': ", ".join(filmo) # DB에 저장할 때 문자열로 변환
            }

        except Exception as e:
            # 실패하면 로그라도 찍어봅시다.
            print(f"!!! {clean_name} 수집 실패: {e}")
            return None