import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const cleanEmail = dto.email.toLowerCase().trim();

    // Check if user already exists - strictly prevent creating duplicate profiles
    const existing = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      throw new ConflictException('An account with this email address already exists. Please sign in instead.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Format doctor name with Dr. prefix if not already present
    let formattedName = dto.fullName.trim();
    if (dto.role === 'DOCTOR' && !formattedName.toLowerCase().startsWith('dr.')) {
      formattedName = `Dr. ${formattedName}`;
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: cleanEmail,
        phone: dto.phone || null,
        passwordHash,
        role: dto.role as any,
        status: 'ACTIVE',
      },
    });

    // Create role-specific profile
    if (dto.role === 'PATIENT') {
      await this.prisma.patientProfile.create({
        data: { 
          userId: user.id,
          fullName: formattedName,
        },
      });
    } else if (dto.role === 'DOCTOR') {
      await this.prisma.doctorProfile.create({
        data: { 
          userId: user.id,
          fullName: formattedName,
          specialization: dto.specialization || 'General Physician',
          licenseNumber: dto.licenseNumber || `MCI-${Math.floor(10000 + Math.random() * 90000)}`,
          experience: dto.experience ? Number(dto.experience) : 5,
          consultationFee: dto.consultationFee ? Number(dto.consultationFee) : 600,
          qualifications: dto.qualifications || 'MBBS, MD',
          languages: dto.languages || 'English, Hindi',
          bio: dto.bio || 'Experienced medical professional committed to evidence-based clinical care and virtual consultations.',
          profilePhoto: dto.profilePhoto || null,
          certificateUrl: dto.certificateUrl || null,
          verificationStatus: 'APPROVED', // Verified by AI
        },
      });
    }

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: formattedName,
        fullName: formattedName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async login(dto: LoginDto) {
    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const displayName = user.doctorProfile?.fullName || user.patientProfile?.fullName || user.email.split('@')[0];

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: displayName,
        fullName: displayName,
        role: user.role,
        status: user.status,
        doctorProfile: user.doctorProfile,
        patientProfile: user.patientProfile,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, status: true },
    });
  }
}
