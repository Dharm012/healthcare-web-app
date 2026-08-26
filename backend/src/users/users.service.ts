import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string, role: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = null;

    if (role === 'PATIENT') {
      profile = await this.prisma.patientProfile.findUnique({
        where: { userId },
      });
    } else if (role === 'DOCTOR') {
      profile = await this.prisma.doctorProfile.findUnique({
        where: { userId },
      });
    }

    return {
      ...user,
      name: profile?.fullName || user.email.split('@')[0],
      fullName: profile?.fullName || user.email.split('@')[0],
      profile,
    };
  }
}
