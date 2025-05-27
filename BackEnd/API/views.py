from rest_framework import  status
from rest_framework.response import Response
from rest_framework.views import APIView
from API.serializers import CameraSerializer, AlertPostSerializer,AlertGetSerializer
from rest_framework.permissions import IsAuthenticated
from API.models import Camera, FireDetectedAlert
from django.shortcuts import get_object_or_404
from django.db.models import Q
import psutil
from API.utils import get_system_status
import logging
import os
from WS.utils import send_fire_alert



logger = logging.getLogger(__name__)


class HelloWorld(APIView):
    def get(self, request):
        return Response({"message": "Hello, World!"}, status=status.HTTP_200_OK)
    
    def post(self, request):
        return Response({"message": "Hello, World! using POST Request"}, status=status.HTTP_200_OK)
    def put(self, request):
        return Response({"message": "Hello, World! using PUT Request"}, status=status.HTTP_200_OK)
    def delete(self, request):
        return Response({"message": "Hello, World! using DELETE Request"}, status=status.HTTP_200_OK)
    def patch(self, request):
        return Response({"message": "Hello, World! using PATCH Request"}, status=status.HTTP_200_OK)

# List all registered Cameras and Register a New Cameras
class CameraList(APIView):
    def get(self, request):
        cameras = Camera.objects.all()
        serializer = CameraSerializer(cameras, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = CameraSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    
# Get Camera Details, Start Monitoring Camera, Stop  Monitoring Camera
class CameraDetail(APIView):
    def put(self, request, id):
        camera = get_object_or_404(Camera, id=id)
        serializer = CameraSerializer(camera, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, id):
        camera = get_object_or_404(Camera, id=id)
        camera.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# # Start Detection
# class StartDetection(APIView):
#     def post(self, request, id):
#         # Simulate or trigger YOLO detection here
#         return Response({f"message": f"Detection started for camera {id}"}, status=status.HTTP_200_OK)
# # Stop Detection
# class StopDetection(APIView):
#     def post(self, request, id):
#         # Simulate or trigger YOLO detection stop here
#         camera = get_object_or_404(Camera, id=id)
#         return Response({"message": f"Detection stopped for camera {camera.name}(IP: {camera.camera_ip})"}, status=status.HTTP_200_OK)
    
# List all Alert and Get DetectionHistory
class Alert(APIView):
    def get(self, request):
        events = FireDetectedAlert.objects.filter(Q(status="active") | Q(status="pending"))
        serializer = AlertGetSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AlertDetectionHistory(APIView):
        def get(self, request):
            events = FireDetectedAlert.objects.all()
            serializer = AlertGetSerializer(events, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        def post(self, request):
            print("Received POST request for fire detection alert.")
            data = request.data.copy()
            print(f"Request data: {data}")
            camera_ip = data.get('camera_ip', None)
            if not camera_ip:
                print("Camera IP is missing in the request data.")
                return Response({"error": "Camera IP is required."}, status=status.HTTP_400_BAD_REQUEST)
            try:
                camera = Camera.objects.get(camera_ip=camera_ip)
            except Camera.DoesNotExist:
                logger.error(f"Camera with IP {camera_ip} not found.")
                return Response({"error": "Camera not found."}, status=status.HTTP_404_NOT_FOUND)
            data['camera_id'] = camera.id 
            data.pop('camera_ip', None)  # Remove camera_ip from data if it exists
            serializer = AlertPostSerializer(data=data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            message = "Fire detected!"
            # Send notification
            camera_info = camera
            print(camera_info)
            if camera_info:
                message = f"Fire detected in camera {camera_info.name} (IP: {camera_info.camera_ip})"
            else:
                logger.warning("Camera information not found for the alert.")
            send_fire_alert(message, camera_info)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        def put(self, request):
            id = request.data.pop('id', None)
            event = get_object_or_404(FireDetectedAlert, id=id)
            serializer = AlertPostSerializer(event, data=request.data, partial=True)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)



# System Information 
class SystemInfo(APIView):
    def get(self, request):
        try:
            cpu = psutil.cpu_percent(interval=None)
            memory = psutil.virtual_memory().percent
            disk = psutil.disk_usage('/').percent
            uptime = int(psutil.boot_time())
            load_avg = os.getloadavg() if hasattr(os, "getloadavg") else None

            system_status = get_system_status(cpu, memory, disk)

            system_info = {
                "cpu_usage": cpu,
                "memory_usage": memory,
                "disk_usage": disk,
                "uptime_seconds": uptime,
                "load_average": load_avg,
                "system_status": system_status,
            }
            return Response(system_info, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"System info retrieval failed: {e}")
            return Response(
                {"error": "Failed to retrieve system information"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        


# # Get Event Details
# class EventDetail(APIView):
#     def get(self, request, id):
#         event = get_object_or_404(FireDetectedAlert, id=id)
#         serializer = FireDetectionEventSerializer(event)
#         return Response(serializer.data, status=status.HTTP_200_OK)
    
#     def put(self, request, id):
#         event = get_object_or_404(FireDetectedAlert, id=id)
#         serializer = FireDetectionEventSerializer(event, data=request.data, partial=True)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_200_OK)