import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ConsultationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ConsultationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Consultation client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Consultation client disconnected: ${client.id}`);
    this.server.emit('peer-disconnected', { socketId: client.id });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId?: string; role?: string; name?: string },
  ) {
    const { roomId, role, name } = payload;
    client.join(roomId);
    this.logger.log(`Socket ${client.id} (${name || role}) joined room ${roomId}`);

    // Notify other peers in the room that a new user has joined
    client.to(roomId).emit('user-joined', {
      socketId: client.id,
      role,
      name,
    });

    return { event: 'room-joined', data: { roomId, socketId: client.id } };
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; offer: any; senderRole?: string },
  ) {
    client.to(payload.roomId).emit('offer', {
      offer: payload.offer,
      senderSocketId: client.id,
      senderRole: payload.senderRole,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; answer: any },
  ) {
    client.to(payload.roomId).emit('answer', {
      answer: payload.answer,
      senderSocketId: client.id,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; candidate: any },
  ) {
    client.to(payload.roomId).emit('ice-candidate', {
      candidate: payload.candidate,
      senderSocketId: client.id,
    });
  }

  @SubscribeMessage('in-call-message')
  handleInCallMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; sender: string; text: string; time: string },
  ) {
    this.server.to(payload.roomId).emit('in-call-message', payload);
  }

  @SubscribeMessage('end-call')
  handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; senderRole?: string },
  ) {
    this.logger.log(`Call ended in room ${payload.roomId} by ${payload.senderRole}`);
    this.server.to(payload.roomId).emit('call-ended', {
      senderRole: payload.senderRole,
    });
  }
}
