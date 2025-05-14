from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from WS.utils import send_fire_alert
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class AlertView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        message = request.data.get("message","Default Fire Alert")
        send_fire_alert(message)
        return Response({"message": "Alert sent successfully!"}, status=status.HTTP_200_OK)