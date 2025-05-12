from django.urls import include, path
from API import views
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView

urlpatterns = [
    path("", views.HelloWorld.as_view(), name="hello_world"),
    path("token/",TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/",TokenRefreshView.as_view(), name="token_refresh"),
    path("cameras/",views.CameraList.as_view(), name="camera_list"),
    path("cameras/<int:id>/",views.CameraDetail.as_view(), name="camera_detail"),
    path("cameras/<id>/start/",views.CameraStart.as_view(), name="camera_start"),
    path("cameras/<id>/stop/",views.CameraStop.as_view(), name="camera_stop"),
    path("events/",views.EventList.as_view(), name="event_list"),
    path("events/<int:id>/",views.EventList.as_view(), name="event_detail"),
    
]