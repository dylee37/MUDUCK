from django.contrib import admin
from .models import Musical, Venue, Actor, Performance

@admin.register(Musical)
class MusicalAdmin(admin.ModelAdmin):
    # 목록에서 보여줄 항목들 (제목, 장소, 시작일 순으로 보면 편해요)
    list_display = ('title', 'venue', 'start_date', 'end_date', 'kopis_id')
    # 제목으로 검색할 수 있게 설정
    search_fields = ('title',)
    # 오른쪽 사이드바에서 장소별로 필터링 가능
    list_filter = ('start_date', 'venue')
    # 한 페이지에 보여줄 개수 (한번에 많이 지우려면 200 정도로 추천)
    list_per_page = 200

admin.site.register(Venue)
admin.site.register(Actor)
admin.site.register(Performance)