from django.db import models

# Create your models here.
class Camera(models.Model):
    name= models.CharField(max_length=100)
    camera_ip= models.GenericIPAddressField(protocol='IPv4')
    location= models.CharField(max_length=255, blank=True)
    is_active= models.BooleanField(default=True)
    created_at= models.DateTimeField(auto_now_add=True)

class FireDectionEvent(models.Model):
    camera= models.ForeignKey(Camera, on_delete=models.CASCADE)
    timestamp= models.DateTimeField(auto_now_add=True)
    detected = models.BooleanField(default=False)
    confidence= models.FloatField()
    frame = models.ImageField(upload_to='fdetections/',null=True, blank=True)