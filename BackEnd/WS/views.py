from django.shortcuts import render
from rest_framework.views import APIView

# Create your views here.
class AlertView(APIView):
    # web socket 
    def get(self, request):
        # Logic to handle GET request for alert
        pass