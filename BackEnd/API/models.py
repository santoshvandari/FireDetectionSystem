from django.db import models

# Create your models here.
class Camera(models.Model):
    name= models.CharField(max_length=100)
    # camera_ip= models.GenericIPAddressField(protocol='IPv4')
    camera_ip = models.CharField(max_length=100, unique=True)
    location= models.CharField(max_length=255, blank=False)
    is_active= models.BooleanField(default=True)
    created_at= models.DateTimeField(auto_now_add=True)

class FireDetectedAlert(models.Model):
    camera_id = models.ForeignKey(Camera, on_delete=models.CASCADE)
    timestamp= models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="active")
    confidence= models.FloatField()
    detected_frame = models.ImageField(upload_to='fdetections/',null=True, blank=True)