from django.urls import include, path
from API import views
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView

urlpatterns = [
    path("", views.HelloWorld.as_view(), name="hello_world"),
    # JWT Authentication
    path("token/",TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/",TokenRefreshView.as_view(), name="token_refresh"),
    # Camera Management
    path("cameras/",views.CameraList.as_view(), name="cameras_list"),
    path("camera/<int:id>/",views.CameraDetail.as_view(), name="camera_detail"),
    # Camera Start and Stop Detection
    path("camera/<id>/start/",views.StartDetection.as_view(), name="camera_start"),
    path("camera/<id>/stop/",views.StopDetection.as_view(), name="camera_stop"),
    # Fire Detection Event
    path("events/",views.EventList.as_view(), name="event_list"),
    path("events/<int:id>/",views.EventDetail.as_view(), name="event_detail"),
    
]