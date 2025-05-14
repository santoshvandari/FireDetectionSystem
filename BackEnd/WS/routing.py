from django.urls import path
from WS.consumers import AlertConsumer

websocket_urlpatterns = [
    path("ws/alert/", AlertConsumer.as_asgi(), name="alert_ws"),
]