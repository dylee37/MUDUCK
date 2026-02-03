from django.db import models

# 1. 공연장 정보 (장소 그 자체)
class Venue(models.Model):
    kopis_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100) # 예: 블루스퀘어 신한카드홀
    address = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

# 2. 배우 정보 (인물 도감)
class Actor(models.Model):
    name = models.CharField(max_length=100)
    source_id = models.CharField(max_length=50, unique=True, null=True, blank=True) # PlayDB 고유번호
    profile_img = models.URLField(blank=True, null=True) # 배우 얼굴 사진
    external_link = models.URLField(blank=True, null=True) # 배우 상세페이지 링크

# 3. 뮤지컬 작품 정보 (대주제)
class Musical(models.Model):
    kopis_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200) # 예: 뮤지컬 <레베카>
    poster_url = models.URLField(blank=True, null=True)
    start_date = models.DateField() # 공연 시작일 (예: 2024-01-01)
    end_date = models.DateField()   # 공연 종료일 (예: 2024-03-31)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='musicals')
    actors = models.ManyToManyField('Actor', related_name='musicals', blank=True) # 뮤지컬 참여 배우진

    def __str__(self):
        return self.title

# 4. 공연 회차 정보 (핵심: "오늘 누가 나오나?")
class Performance(models.Model):
    # 어떤 작품의 회차인가? (예: 레베카)
    musical = models.ForeignKey(Musical, on_delete=models.CASCADE, related_name='performances')
    
    # 정확히 언제 공연인가? (예: 2024년 2월 10일 14:00)
    date_time = models.DateTimeField() 
    
    # [중요] 이 '회차'에만 출연하는 배우들 (예: 오늘 낮공은 조승우, 밤공은 홍광호)
    # 이 ManyToMany 관계가 있어야 "조승우가 출연하는 날짜"만 골라 알림을 줄 수 있음
    actors = models.ManyToManyField(Actor, related_name='performances')

    def __str__(self):
        return f"{self.musical.title} - {self.date_time}"