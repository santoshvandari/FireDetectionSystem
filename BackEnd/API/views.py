from rest_framework import  status
from rest_framework.response import Response
from rest_framework.views import APIView
from API.serializers import CameraSerializer, AlertPostSerializer,AlertGetSerializer
from rest_framework.permissions import IsAuthenticated
from API.models import Camera, FireDetectedAlert
from django.shortcuts import get_object_or_404


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
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
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

# Start Detection
class StartDetection(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, id):
        # Simulate or trigger YOLO detection here
        return Response({f"message": f"Detection started for camera {id}"}, status=status.HTTP_200_OK)
# Stop Detection
class StopDetection(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, id):
        # Simulate or trigger YOLO detection stop here
        camera = get_object_or_404(Camera, id=id)
        return Response({"message": f"Detection stopped for camera {camera.name}(IP: {camera.camera_ip})"}, status=status.HTTP_200_OK)
    
# List all Alert and Get DetectionHistory
class Alert(APIView):
    def get(self, request):
        events = FireDetectedAlert.objects.filter(status="active")
        serializer = AlertGetSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = AlertPostSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AlertDetectionHistory(APIView):
        def get(self, request):
            events = FireDetectedAlert.objects.all()
            serializer = AlertGetSerializer(events, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)





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