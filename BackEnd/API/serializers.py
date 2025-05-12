from rest_framework import serializers
from API.models import Camera, FireDectionEvent   

class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = '__all__'

class FireDetectionEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FireDectionEvent
        fields = '__all__'