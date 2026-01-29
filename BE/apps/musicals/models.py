from django.db import models

class Venue(models.Model):
    kopis_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

class Actor(models.Model):
    name = models.CharField(max_length=100)
    profile_img = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class Musical(models.Model):
    kopis_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    poster_url = models.URLField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='musicals')
    
    def __str__(self):
        return self.title

class Performance(models.Model):
    musical = models.ForeignKey(Musical, on_delete=models.CASCADE, related_name='performances')
    date_time = models.DateTimeField()
    actors = models.ManyToManyField(Actor, related_name='performances')

    def __str__(self):
        return f"{self.musical.title} - {self.date_time}"