import json
from channels.generic.websocket import AsyncWebsocketConsumer

class FireAlertConsumer(AsyncWebsocketConsumer):
    # Connect to the WebSocket
    async def connect(self):
        # Join the alert group
        self.room_group_name = "fire_alert_group"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    #  Disconnect from the WebSocket
    async def disconnect(self, close_code):
        # Leave the alert group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    # Receive message from WebSocket
    async def receive(self, text_data):
        # Handle incoming messages
        # data = json.loads(text_data)
        # message = data.get('message', 'No message provided')

        # # Send the message to the alert group
        # await self.channel_layer.group_send(
        #     self.room_group_name,
        #     {
        #         'type': 'alert_message',
        #         'message': message
        #     }
        # )
        pass

    # Send message to WebSocket
    async def alert_message(self, event):
        # Send the message to WebSocket
        camera_id = event['camera_id']
        message = event['message']
        await self.send(text_data=json.dumps({
            'camera_id': camera_id,
            'type': 'alert_message',
            'message': message,
            'camera_name': event.get('camera_name', 'Unknown Camera'),
            'camera_ip': event.get('camera_ip', 'Unknown IP'),
            'location': event.get('location', 'Unknown Location')
        }))
    
