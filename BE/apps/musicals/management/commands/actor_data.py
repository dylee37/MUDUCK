import os
import re
import requests
import xml.etree.ElementTree as ET
from django.core.management.base import BaseCommand
from apps.musicals.models import Musical, Actor
from django.db import connection
from dotenv import load_dotenv

load_dotenv()

class Command(BaseCommand):
    help = 'KOPIS 상세 정보를 바탕으로 배우 이름 리스트만 우선 수집합니다.'

    def handle(self, *args, **options):
        # 1. 기존 배우 데이터 초기화 (ID 자동증가 값 포함)
        self.stdout.write("기존 배우 데이터를 초기화합니다...")
        Actor.objects.all().delete()
        with connection.cursor() as cursor:
            # 테이블명 'musicals_actor'가 맞는지 확인 필요 (앱이름_모델명)
            cursor.execute("SELECT setval(pg_get_serial_sequence('musicals_actor', 'id'), 1, false);")

        KOPIS_API_KEY = os.getenv('KOPIS_API')
        musicals = Musical.objects.all()

        if not musicals.exists():
            self.stdout.write(self.style.WARNING("DB에 뮤지컬 데이터가 없습니다."))
            return

        for musical in musicals:
            self.stdout.write(f"\n>>> [{musical.title}] 배우 명단 추출 중...")
            
            # KOPIS 상세 API 호출
            kopis_url = f"http://www.kopis.or.kr/openApi/restful/pblprfr/{musical.kopis_id}?service={KOPIS_API_KEY}"
            
            try:
                res = requests.get(kopis_url)
                tree = ET.fromstring(res.content)
                prfcast = tree.find('.//prfcast').text if tree.find('.//prfcast') is not None else ""
                
                if not prfcast or prfcast.strip() == "":
                    self.stdout.write(f"   - 출연진 정보 없음")
                    continue

                # 배우 이름 정제 (쉼표 분리 + '외 n명' 제거 + 공백 제거 + 중복 제거)
                raw_names = prfcast.split(',')
                names = list(set([re.sub(r'\s*(등|외|및|외\s*\d+명).*$', '', n).strip() for n in raw_names]))

                for name in names:
                    if not name: continue
                    
                    # 2. 이름으로만 Actor 생성 (이미 있으면 가져오기)
                    actor, created = Actor.objects.get_or_create(name=name)
                    
                    # 3. 뮤지컬과 배우 연결 (M:M)
                    musical.actors.add(actor)
                    
                    status = "생성" if created else "기존"
                    self.stdout.write(f"   - {name} ({status} 완료)")

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error: {musical.title} - {e}"))

        self.stdout.write(self.style.SUCCESS("\n모든 뮤지컬의 배우 이름 수집이 완료되었습니다!"))