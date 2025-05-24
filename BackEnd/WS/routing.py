from django.urls import path
from WS.consumers import FireAlertConsumer

websocket_urlpatterns = [
    path("ws/alert/", FireAlertConsumer.as_asgi(), name="alert_ws"),
]