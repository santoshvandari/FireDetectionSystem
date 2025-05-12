from rest_framework import  status
from rest_framework.response import Response
from rest_framework.views import APIView


class HelloWorld(APIView):
    def get(self, request):
        return Response({"message": "Hello, World!"}, status=status.HTTP_404_NOT_FOUND)
    
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
        # Logic to retrieve and return the list of cameras
        return Response({"message": "List of cameras"}, status=status.HTTP_200_OK)
    
    def post(self, request):
        # Logic to register a new camera
        return Response({"message": "Camera registered"}, status=status.HTTP_201_CREATED)
    
# Get Camera Details, Start Monitoring Camera, Stop  Monitoring Camera
class CameraDetail(APIView):
    def get(self, request, id):
        # Logic to retrieve and return camera details
        return Response({"message": f"Camera details for {id}"}, status=status.HTTP_200_OK)
    
    def post(self, request, id):
        # Logic to start the camera
        return Response({"message": f"Camera {id} started"}, status=status.HTTP_200_OK)
    
    def delete(self, request, id):
        # Logic to stop the camera
        return Response({"message": f"Camera {id} stopped"}, status=status.HTTP_200_OK)
    
# List all Events and Get Event Details
class EventList(APIView):
    def get(self, request):
        # Logic to retrieve and return the list of events
        return Response({"message": "List of events"}, status=status.HTTP_200_OK)
    
    def get(self, request, id):
        # Logic to retrieve and return event details
        return Response({"message": f"Event details for {id}"}, status=status.HTTP_200_OK)