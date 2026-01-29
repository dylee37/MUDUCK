# KOPIS에서 뮤지컬 정보를 가져옴
# 기간: 20240101~20261231
# 장르: 뮤지컬
# 특성: 대학로, 뮤지컬 라이센스, 뮤지컬 창작, 수상작 (아동, 축제 제외)
# 좌석: 300석 이상 -> 확인되지 않는 좌석이 많은 관계로 일단 제외

import os
import time
import requests
import xmltodict
from django.core.management.base import BaseCommand
from apps.musicals.models import Musical, Venue
from datetime import datetime
from dotenv import load_dotenv

load_dotenv() 

class Command(BaseCommand):
    help = '아동극/축제를 제외한 2024~2026년 뮤지컬 데이터를 수집합니다. (에러 방어 강화)'

    def handle(self, *args, **options):
        API_KEY = os.getenv('KOPIS_API')
        STDATE = "20240101" 
        EDDATE = "20261231" 
        cpage = 1

        child_keywords = [

                            '뽀로로', '번개맨', '신비아파트', '티니핑', '핑크퐁', '카봇', 
                            '공룡', '인어공주', '신데렐라', '하츄핑', '겨울왕국', '가족뮤지컬', 
                            '아동', '어린이', '브레드이발소', '콩순이', '시크릿쥬쥬', '똥',
                            '백설공주', '두근두근', '탐험대', '아기돼지', '보물섬', '다이노',
                            '엘사', '안나', '피터팬', '렛잇고', '야수', '로보카폴리', '거제',
                            '포천', '제주', '헨젤', '피터래빗', '타요', '버스', '장화신은', 
                            '물고기', '도깨비', '까투리' ,'호랑이', '임금님', '공주', '프린세스',
                            '모험', '라푼젤', '방귀', '토끼', '여주', '도봉', 'TV',
                            '급식왕', '용사', '요정', '콩쥐', '콘서트', '호두까기', '선사시대',
                            '산타', '넌센스' ,'의정부', '영천', '시흥', '상어', '수박', '아저씨',
                            '돼지', '양주', '진해', '엄마', '아빠', '공연', '햄버거', '콧구멍',
                            '울주', '과천', '버블젬', '나무아이', '퇴근', '피노키오', '샤베트',
                            '대학교', '음악극', '친구들', '뚜식이', '냉장고', '코코몽', '구름빵',
                            '별주부전', '거북이', '흥부', '트롯', '우당탕탕', '콩쿠르', '광진', '함양',
                            '익산', '강서', '군포', '계양', '요술램프'

                        ]

        self.stdout.write(f"수집 시작: {STDATE} ~ {EDDATE}")

        while True:
            list_url = f"http://www.kopis.or.kr/openApi/restful/pblprfr?service={API_KEY}&stdate={STDATE}&eddate={EDDATE}&shcate=GGGA&rows=100&cpage={cpage}"
            
            try:
                res = requests.get(list_url)
                data_dict = xmltodict.parse(res.content)
                
                if 'dbs' not in data_dict or not data_dict['dbs']:
                    self.stdout.write(self.style.SUCCESS(f"수집 완료! 마지막 페이지: {cpage-1}"))
                    break

                items = data_dict['dbs']['db']
                if isinstance(items, dict): items = [items]

                for item in items:
                    prfnm = item.get('prfnm', '제목 없음')
                    
                    # 1. 키워드 필터링 (리스트 데이터에서 먼저 1차 차단)
                    if any(kw in prfnm for kw in child_keywords):
                        self.stdout.write(f"   -> 필터링됨: {prfnm}")
                        continue

                    # --- [개별 공연 상세 조회 시작] ---
                    try:
                        mt20id = item['mt20id']
                        detail_url = f"http://www.kopis.or.kr/openApi/restful/pblprfr/{mt20id}?service={API_KEY}"
                        
                        time.sleep(0.12) # API 호출 제한 준수
                        detail_res = requests.get(detail_url)
                        
                        # XML 파싱 에러 방어 (syntax error 대응)
                        try:
                            detail_data = xmltodict.parse(detail_res.content)
                        except Exception:
                            self.stdout.write(self.style.WARNING(f"   [건너뜀] XML 형식 오류: {prfnm}"))
                            continue
                        
                        if 'dbs' in detail_data and 'db' in detail_data['dbs']:
                            info = detail_data['dbs']['db']
                            
                            # 2. 상세 정보 기반 추가 필터링 (kids, festival 필드)
                            if info.get('kids') == 'Y' or info.get('festival') == 'Y':
                                continue

                            # 3. 데이터 정제 (포스터 누락/좌석수)
                            poster_url = info.get('poster') or ''  # null 방지
                            seats_val = info.get('pcseast', '0').strip()
                            seats = int(seats_val) if seats_val.isdigit() else 0

                            # 4. DB 저장
                            venue, _ = Venue.objects.get_or_create(
                                kopis_id=info['fcltynm'], 
                                defaults={'name': info['fcltynm']}
                            )

                            musical, created = Musical.objects.get_or_create(
                                kopis_id=mt20id,
                                defaults={
                                    'title': info['prfnm'],
                                    'poster_url': poster_url,
                                    'start_date': datetime.strptime(info['prfpdfrom'], '%Y.%m.%d').date(),
                                    'end_date': datetime.strptime(info['prfpdto'], '%Y.%m.%d').date(),
                                    'venue': venue,
                                }
                            )

                            if created:
                                self.stdout.write(self.style.SUCCESS(f"   => 추가 완료: {info['prfnm']} ({seats}석)"))
                            else:
                                self.stdout.write(f"   (이미 존재: {info['prfnm']})")

                    except Exception as e:
                        # 특정 한 공연의 에러가 전체 수집을 멈추지 않게 함
                        self.stdout.write(self.style.ERROR(f"   [개별 공연 에러] {prfnm}: {e}"))
                        continue

                cpage += 1 

            except Exception as e:
                # 리스트 호출 자체가 실패할 경우에만 중단
                self.stdout.write(self.style.ERROR(f"리스트 호출 에러: {e}"))
                break