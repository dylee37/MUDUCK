from django.db import models

class TicketNotice(models.Model):
    musical = models.ForeignKey('musicals.Musical', on_delete=models.CASCADE, related_name='notices')
    site = models.CharField(max_length=50) # 예매플랫폼
    open_at = models.DateTimeField()
    url = models.URLField(blank=True, null=True)
    is_custom = models.BooleanField(default=False) # 단관 등 특수회차 여부
    raw_text = models.TextField(blank=True) # AI 분석 전 원문 데이터

    def __str__(self):
        return f"[{self.site}] {self.musical.title}"