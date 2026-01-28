from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 이메일을 아이디로 사용할 경우를 대비해 확장성 있게 구성
    nickname = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return self.username

class UserActorFavorite(models.Model):
    # 배우 즐겨찾기
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='actor_favorites')
    actor = models.ForeignKey('musicals.Actor', on_delete=models.CASCADE, related_name='favored_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'actor') # 중복 방지

class UserMusicalFavorite(models.Model):
    #뮤지컬 작품 즐겨찾기
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='musical_favorites')
    musical = models.ForeignKey('musicals.Musical', on_delete=models.CASCADE, related_name='favored_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'musical') # 중복 방지