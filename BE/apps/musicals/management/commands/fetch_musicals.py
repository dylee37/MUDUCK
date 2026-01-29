# KOPIS에서 데이터 구축 (2024~2026, 대학로 및 소극장 일단 제외)

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
    help = '2024~2026년 KOPIS 뮤지컬 데이터를 전체 수집합니다.'

    def handle(self, *args, **options):
        API_KEY = os.getenv('KOPIS_API')
        if not API_KEY:
            self.stdout.write(self.style.ERROR("API 키 누락"))
            return

        # 수집 기간 설정 (24년 ~ 26년)
        STDATE = "20240101" 
        EDDATE = "20261231" 
        cpage = 1 # 1페이지부터 시작

        self.stdout.write(f"{STDATE} ~ {EDDATE} 기간 데이터 수집 시작...")

        while True:
            # rows=100으로 한 번에 많이 가져오기 (1초당 10회 제한 안 걸리게 효율화)
            URL = f"http://www.kopis.or.kr/openApi/restful/pblprfr?service={API_KEY}&stdate={STDATE}&eddate={EDDATE}&shcate=GGGA&rows=100&cpage={cpage}"
            
            try:
                response = requests.get(URL)
                data_dict = xmltodict.parse(response.content)
                
                # 데이터가 더 이상 없으면 루프 종료
                if 'dbs' not in data_dict or not data_dict['dbs']:
                    self.stdout.write(self.style.SUCCESS(f"모든 수집 완료! 최종 페이지: {cpage-1}"))
                    break

                items = data_dict['dbs']['db']
                if isinstance(items, dict): items = [items]

                for item in items:
                    # [필터링 예시] 대학로 제외 로직을 넣고 싶다면?
                    # 공연장 이름에 '대학로'가 포함되어 있으면 건너뛰기
                    if "대학로" in item['fcltynm']:
                        continue

                    # 공연장 저장
                    venue, _ = Venue.objects.get_or_create(
                        kopis_id=item['fcltynm'], 
                        defaults={'name': item['fcltynm']}
                    )

                    # 뮤지컬 저장 (이미 있으면 Pass, 없으면 Create)
                    musical, created = Musical.objects.get_or_create(
                        kopis_id=item['mt20id'],
                        defaults={
                            'title': item['prfnm'],
                            'poster_url': item['poster'],
                            'start_date': datetime.strptime(item['prfpdfrom'], '%Y.%m.%d').date(),
                            'end_date': datetime.strptime(item['prfpdto'], '%Y.%m.%d').date(),
                            'venue': venue,
                        }
                    )
                    
                    if created:
                        self.stdout.write(f"신규 추가: {musical.title}")

                # KOPIS 1초당 10회 호출 제한 준수 (0.2초 대기)
                time.sleep(0.2)
                cpage += 1 # 다음 페이지로 이동

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"에러 발생: {e}"))
                break