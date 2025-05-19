from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_fire_alert(message):
    """
    Send a fire alert message to the WebSocket group.
    """
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "fire_alert_group",
        {
            "type": "alert_message",
            "message": message,
        }
    )