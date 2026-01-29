# KOPIS에서 뮤지컬 정보를 가져옴
# 기간: 20240101~20261231
# 장르: 뮤지컬
# 특성: 대학로, 뮤지컬 라이센스, 뮤지컬 창작, 수상작 (아동, 축제 제외)
# 좌석: 300석 이상

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
    help = '아동극/축제를 제외한 300석 이상의 뮤지컬 데이터를 수집합니다.'

    def handle(self, *args, **options):
        API_KEY = os.getenv('KOPIS_API')
        STDATE = "20240101" 
        EDDATE = "20261231" 
        cpage = 1

        self.stdout.write(f"수집 시작: {STDATE} ~ {EDDATE} (아동/축제 제외, 300석 이상)")

        while True:
            list_url = f"http://www.kopis.or.kr/openApi/restful/pblprfr?service={API_KEY}&stdate={STDATE}&eddate={EDDATE}&shcate=GGGA&rows=100&cpage={cpage}"
            
            try:
                res = requests.get(list_url)
                data_dict = xmltodict.parse(res.content)
                
                if 'dbs' not in data_dict or not data_dict['dbs']:
                    break

                items = data_dict['dbs']['db']
                if isinstance(items, dict): items = [items]

                for item in items:
                    mt20id = item['mt20id']
                    detail_url = f"http://www.kopis.or.kr/openApi/restful/pblprfr/{mt20id}?service={API_KEY}"
                    
                    time.sleep(0.12) # 1초당 10회 제한 준수
                    detail_res = requests.get(detail_url)
                    detail_data = xmltodict.parse(detail_res.content)
                    
                    if 'dbs' in detail_data and 'db' in detail_data['dbs']:
                        info = detail_data['dbs']['db']
                        
                        # --- [필터링 로직 시작] ---
                        
                        # 1. 아동용 공연 제외 (info['kids']가 'Y'이면 건너뜀)
                        if info.get('kids') == 'Y':
                            continue
                            
                        # 2. 축제 제외 (info['festival']이 'Y'이면 건너뜀)
                        if info.get('festival') == 'Y':
                            continue

                        # 3. 좌석수 300석 이상 필터링
                        seats = int(info.get('pcseast', 0) or 0)
                        if seats < 300:
                            continue
                        
                        # --- [필터링 로직 끝] ---

                        venue, _ = Venue.objects.get_or_create(
                            kopis_id=info['fcltynm'], 
                            defaults={'name': info['fcltynm']}
                        )

                        musical, created = Musical.objects.get_or_create(
                            kopis_id=mt20id,
                            defaults={
                                'title': info['prfnm'],
                                'poster_url': info['poster'],
                                'start_date': datetime.strptime(info['prfpdfrom'], '%Y.%m.%d').date(),
                                'end_date': datetime.strptime(info['prfpdto'], '%Y.%m.%d').date(),
                                'venue': venue,
                            }
                        )

                        if created:
                            self.stdout.write(f"추가 완료: {info['prfnm']} ({seats}석)")

                cpage += 1 

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"에러: {e}"))
                break