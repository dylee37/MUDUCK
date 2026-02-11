from django.contrib import admin
from .models import Musical, Venue, Actor, Performance

@admin.register(Musical)
class MusicalAdmin(admin.ModelAdmin):
    list_display = ('title', 'venue', 'start_date', 'end_date', 'kopis_id')
    search_fields = ('title',)
    list_filter = ('start_date', 'venue')
    list_per_page = 200

# --- 배우(Actor) 관리 설정 추가 ---
@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ('name', 'source_id')  # 목록에 이름과 ID 표시
    search_fields = ('name',)           # 이름으로 검색 가능하게 설정 ★
    list_per_page = 100                 # 한 페이지에 100명씩

# 나머지 모델 등록
admin.site.register(Venue)
admin.site.register(Performance)