# 기간 상관 없이 유명 극을 뽑는 코드

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
    help = '지정된 유명 뮤지컬 키워드로만 타겟 수집을 진행합니다.'

    def handle(self, *args, **options):
        API_KEY = os.getenv('KOPIS_API')
        
        # 1. 수집하고 싶은 유명 뮤지컬 목록 (여기에 원하는 제목을 계속 추가하세요)
        famous_keywords = [
            '레베카', '엘리자벳', '지킬앤하이드', '드라큘라', '데스노트', '시카고', 
            '베르테르', '팬텀', '마리 앙투아네트', '안나 카레니나', '노트르담 드 파리',
            '맘마미아', '오페라의 유령', '캣츠', '레미제라블', '시라노', '햄릿', 
            '위키드', '킹키부츠', '프랑켄슈타인', '웃는 남자', '모차르트!', '레드북',
            '스토리 오브 마이라이프', '프리다', '마타하리', '베르사유의 장미', '벤자민 버튼',
            '시스터 액트', '벤허', '베토벤', '엑스칼리버', '빌리 엘리어트', '미세스 다웃파이어',
            '하데스타운', '빨래', '헤드윅', '물랑루즈', '렌트', '팬레터', '마리 퀴리',
            '어쩌면 해피엔딩', '비틀쥬스', '사의찬미', '스웨그에이지', '멤피스', '썸씽로튼',
            '그레이트 코멧', '몬테크리스토', '명성황후', '난쟁이들', '서편제', '등등곡',
            '랭보', '종의 기원', '틱틱붐', '쓰릴 미', '라스트 파이브 이어스', '로빈', 
            '시데레우스', '리지', '디어 에반 핸슨', '영웅', '매디슨 카운티의 다리', 
            '이프덴', '여신님이 보고 계셔', '스모크', '아몬드', '도리안 그레이', '곤 투모로우',
            '베어 더 뮤지컬', '웨스트 사이드 스토리', '일 테노레', '스위니토드'
        ]

        self.stdout.write(self.style.MIGRATE_HEADING(f"총 {len(famous_keywords)}개 키워드 타겟 수집 시작"))

        for keyword in famous_keywords:
            self.stdout.write(f"\n🔍 키워드 검색 중: {keyword}")
            
            # 키워드 검색 URL (과거 데이터도 포함하기 위해 시작일을 2010년으로 설정)
            # shprfnm 파라미터가 핵심입니다.
            url = f"http://www.kopis.or.kr/openApi/restful/pblprfr?service={API_KEY}&stdate=20100101&eddate=20261231&shcate=GGGA&rows=100&cpage=1&shprfnm={keyword}"
            
            try:
                res = requests.get(url)
                data_dict = xmltodict.parse(res.content)
                
                if 'dbs' not in data_dict or not data_dict['dbs']:
                    self.stdout.write(f"   -> '{keyword}' 검색 결과 없음")
                    continue

                items = data_dict['dbs']['db']
                if isinstance(items, dict): items = [items]

                for item in items:
                    prfnm = item.get('prfnm', '')
                    
                    # [주의] 키워드 검색 시에도 아동극(예: '지킬앤하이드' 인형극 등)이 섞일 수 있으므로 
                    # 최소한의 필터링은 거치는 것이 좋습니다.
                    if '어린이' in prfnm or '가족' in prfnm:
                        continue

                    try:
                        mt20id = item['mt20id']
                        detail_url = f"http://www.kopis.or.kr/openApi/restful/pblprfr/{mt20id}?service={API_KEY}"
                        
                        time.sleep(0.12)
                        detail_res = requests.get(detail_url)
                        detail_data = xmltodict.parse(detail_res.content)
                        
                        if 'dbs' in detail_data and 'db' in detail_data['dbs']:
                            info = detail_data['dbs']['db']
                            
                            # 공연장 저장
                            venue, _ = Venue.objects.get_or_create(
                                kopis_id=info['fcltynm'], 
                                defaults={'name': info['fcltynm']}
                            )

                            # 뮤지컬 저장
                            musical, created = Musical.objects.get_or_create(
                                kopis_id=mt20id,
                                defaults={
                                    'title': info['prfnm'],
                                    'poster_url': info.get('poster') or '',
                                    'start_date': datetime.strptime(info['prfpdfrom'], '%Y.%m.%d').date(),
                                    'end_date': datetime.strptime(info['prfpdto'], '%Y.%m.%d').date(),
                                    'venue': venue,
                                }
                            )

                            if created:
                                self.stdout.write(self.style.SUCCESS(f"   [신규] {info['prfnm']}"))
                            else:
                                # 이미 450개 안에 있는 데이터라면 그냥 지나갑니다.
                                pass

                    except Exception as e:
                        continue

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"키워드 '{keyword}' 처리 중 에러: {e}"))
                continue

        self.stdout.write(self.style.SUCCESS("\n타겟 수집 완료!"))