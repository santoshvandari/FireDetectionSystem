from rest_framework import serializers
from API.models import Camera, FireDetectedAlert   

class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = '__all__'

class CameraBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = ['id', 'name']


class AlertPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = FireDetectedAlert
        fields = '__all__'

class AlertGetSerializer(serializers.ModelSerializer):
    camera = CameraBriefSerializer()
    class Meta:
        model = FireDetectedAlert
        fields='__all__'