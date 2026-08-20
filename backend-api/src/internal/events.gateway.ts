import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  broadcastComplaintTriaged(complaintId: string, data: any) {
    this.server.emit('complaint_triaged', {
      complaintId,
      ...data,
    });
  }
}
