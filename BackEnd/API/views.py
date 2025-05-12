from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from API.serializers import GroupSerializer, UserSerializer
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