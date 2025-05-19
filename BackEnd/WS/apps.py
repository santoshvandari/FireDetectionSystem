from django.apps import AppConfig
# from WS.utils import start_fire_detection


class WsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'WS'

    # def ready(self):
    #     start_fire_detection()