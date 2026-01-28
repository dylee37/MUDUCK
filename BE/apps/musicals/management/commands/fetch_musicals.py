import os
import time  # 1초당 호출 제한(10회)을 위해
import requests
import xmltodict
from django.core.management.base import BaseCommand
from apps.musicals.models import Musical, Venue
from datetime import datetime
from dotenv import load_dotenv

load_dotenv() 

class Command(BaseCommand):
    help = 'KOPIS API로부터 뮤지컬 목록을 수집합니다.'

    def handle(self, *args, **options):
        API_KEY = os.getenv('KOPIS_API')
        
        if not API_KEY:
            self.stdout.write(self.style.ERROR("API 키를 찾을 수 없습니다. .env 파일을 확인해주세요."))
            return

        # 2. API 요청 설정 (뮤지컬 카테고리 GGGA, 2026년 공연 데이터 10개)
        STDATE = "20260101" 
        EDDATE = "20261231" 
        URL = f"http://www.kopis.or.kr/openApi/restful/pblprfr?service={API_KEY}&stdate={STDATE}&eddate={EDDATE}&shcate=GGGA&rows=10&cpage=1"

        self.stdout.write("데이터 수집 시작...")

        try:
            # 3. KOPIS 서버에 데이터 요청
            response = requests.get(URL)
            # XML 형식의 응답을 파이썬의 딕셔너리(dict) 구조로 변환
            # XML은 <title>뮤지컬</title> 형태라 쓰기 어렵지만, dict는 ['title']로 바로 접근 가능
            data_dict = xmltodict.parse(response.content)
            
            if 'dbs' not in data_dict or 'db' not in data_dict['dbs']:
                self.stdout.write("수집할 데이터가 없습니다.")
                return

            # 실제 공연 정보가 담긴 리스트 추출
            items = data_dict['dbs']['db']
            
            # 데이터가 딱 1개면 xmltodict가 리스트가 아닌 dict로 주므로, 반복문을 위해 리스트로 감쌈
            if isinstance(items, dict):
                items = [items]

            for item in items:
                # 4. API 과부하 방지 (1초당 10회 제한 준수)
                # 루프가 돌 때마다 0.2초씩 쉬어줌 (1초에 최대 5번 호출하게 설계)
                time.sleep(0.2)

                # 5. 공연장(Venue) 정보 저장 및 가져오기
                # get_or_create: DB에 이미 있으면 가져오고, 없으면 새로 만듦 (중복 방지)
                venue, _ = Venue.objects.get_or_create(
                    kopis_id=item['fcltynm'], # 공연장 이름을 ID 대용으로 사용
                    defaults={'name': item['fcltynm']}
                )

                # 6. 뮤지컬(Musical) 정보 저장
                # musical: DB에 저장된 객체 / created: 새로 만들었으면 True, 이미 있었으면 False
                musical, created = Musical.objects.get_or_create(
                    kopis_id=item['mt20id'], # KOPIS의 공연 고유 코드
                    defaults={
                        'title': item['prfnm'],      # 공연 제목
                        'poster_url': item['poster'], # 포스터 이미지 주소
                        # 문자열 날짜(2026.01.01)를 파이썬 날짜 객체로 변환
                        'start_date': datetime.strptime(item['prfpdfrom'], '%Y.%m.%d').date(),
                        'end_date': datetime.strptime(item['prfpdto'], '%Y.%m.%d').date(),
                        'venue': venue,              # 위에서 만든 공연장 객체 연결
                    }
                )

                # 7. 신규 데이터일 때만 터미널에 알림 출력
                if created:
                    self.stdout.write(f"새 공연 추가: {musical.title}")
                else:
                    self.stdout.write(f"기존 공연 건너뜀: {musical.title}")

            self.stdout.write(self.style.SUCCESS('성공적으로 데이터를 가져왔습니다!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"에러 발생: {e}"))