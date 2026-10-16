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
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  },
})
@Injectable()
export class ConsultationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ConsultationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (token) {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        this.logger.log(`Authenticated consultation client connected: ${client.id} (user: ${payload.sub})`);
        return;
      }
    } catch {
      this.logger.warn(`Unauthenticated consultation socket connected: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Consultation client disconnected: ${client.id}`);
    this.server.emit('peer-disconnected', { socketId: client.id });
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId?: string; role?: string; name?: string },
  ) {
    const { roomId, role, name } = payload;
    const user = client.data.user;

    // Verify room authorization if user is authenticated or verify appointment exists
    if (user && user.sub) {
      try {
        const appointment = await this.prisma.appointment.findFirst({
          where: {
            OR: [{ videoRoomId: roomId }, { id: roomId }],
          },
          include: {
            patient: true,
            doctor: true,
          },
        });

        if (appointment) {
          const isParticipant = 
            appointment.patient?.userId === user.sub || 
            appointment.doctor?.userId === user.sub || 
            user.role === 'ADMIN';

          if (!isParticipant) {
            this.logger.warn(`User ${user.sub} attempted unauthorized access to room ${roomId}`);
            client.emit('error', { message: 'Unauthorized room access' });
            return { event: 'error', data: { message: 'Unauthorized room access' } };
          }
        }
      } catch (err) {
        this.logger.error(`Error verifying room authorization: ${err.message}`);
      }
    }

    client.join(roomId);
    this.logger.log(`Socket ${client.id} (${name || role || 'User'}) joined room ${roomId}`);

    // Notify other peers in the room that a new user has joined
    client.to(roomId).emit('user-joined', {
      socketId: client.id,
      role: user?.role || role,
      name: name || user?.email,
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
    @MessageBody() payload: { roomId: string; sender: string; text: string; time: string; type?: string; metadata?: any },
  ) {
    client.to(payload.roomId).emit('in-call-message', payload);
  }

  @SubscribeMessage('prescription-sync')
  handlePrescriptionSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; prescription: any },
  ) {
    client.to(payload.roomId).emit('prescription-sync', {
      prescription: payload.prescription,
      updatedBy: client.id,
    });
  }

  @SubscribeMessage('prescription-finalized')
  handlePrescriptionFinalized(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; prescription: any },
  ) {
    this.server.to(payload.roomId).emit('prescription-finalized', {
      prescription: payload.prescription,
    });
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
