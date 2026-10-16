import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  
  // Basic user tracking: userId -> socketId
  private connectedUsers = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (token) {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        this.connectedUsers.set(payload.sub, client.id);
        this.logger.log(`Authenticated notifications client connected: ${client.id} (user: ${payload.sub})`);
        return;
      }
    } catch {
      this.logger.warn(`Unauthenticated notifications connection attempt: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove from tracking map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket) {
    const user = client.data.user;
    if (!user || !user.sub) {
      return { event: 'registered', data: { success: false, message: 'Authentication required' } };
    }
    this.logger.log(`Verified user ${user.sub} registered with socket ${client.id}`);
    this.connectedUsers.set(user.sub, client.id);
    return { event: 'registered', data: { success: true, userId: user.sub } };
  }

  // Method to send notification to a specific user
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // Demo broadcast method
  broadcastGlobalAlert(message: string) {
    this.server.emit('notification', { type: 'GLOBAL', message });
  }
}
