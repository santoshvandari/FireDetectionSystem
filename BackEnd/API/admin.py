from django.contrib import admin
from API.models import Camera,FireDectionEvent

# Register your models here.
class CameraAdmin(admin.ModelAdmin):
    list_display = ('name', 'camera_ip', 'location', 'is_active', 'created_at')
    search_fields = ('name', 'camera_ip', 'location')
    list_filter = ('is_active',)
    ordering = ('-created_at',)
    list_per_page = 10


class FireDetectionEventAdmin(admin.ModelAdmin):
    list_display = ('camera', 'timestamp', 'detected', 'confidence')
    search_fields = ('camera__name',)
    list_filter = ('detected',)
    ordering = ('-timestamp',)
    list_per_page = 10

admin.site.register(Camera, CameraAdmin)
admin.site.register(FireDectionEvent, FireDetectionEventAdmin)