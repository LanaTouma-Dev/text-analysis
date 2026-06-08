from channels.generic.websocket import AsyncJsonWebsocketConsumer


class FeedConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('feed', self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard('feed', self.channel_name)

    async def feed_message(self, event):
        """Called by Celery write_to_db via group_send."""
        await self.send_json(event['payload'])
