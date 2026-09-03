import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema } from '@sarangi/validation';
import type { LoginInput, RegisterInput, SendOtpInput, VerifyOtpInput } from '@sarangi/validation';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  async registerStore(input: RegisterInput) {
    const data = registerSchema.parse(input);
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.CUSTOMER,
      },
    });

    // Send the beautifully crafted welcome email asynchronously
    this.mailService.sendWelcomeEmail(user.email ?? data.email, user.firstName ?? data.firstName ?? null).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return this.issueTokens(user.id, user.email ?? data.email, user.role);
  }

  async loginStore(input: LoginInput) {
    const data = loginSchema.parse(input);
    return this.login(data.email, data.password, [UserRole.CUSTOMER]);
  }

  async loginAdmin(input: LoginInput) {
    const data = loginSchema.parse(input);
    return this.login(data.email, data.password, [
      UserRole.ADMIN,
      UserRole.FULFILLMENT,
      UserRole.SUPPORT,
    ]);
  }

  private async login(email: string, password: string, allowedRoles: UserRole[]) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !allowedRoles.includes(user.role)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Please use OTP to login');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email || '', user.role);
  }

  async sendOtp(input: SendOtpInput) {
    const data = sendOtpSchema.parse(input);
    // In a real application, send the OTP via Twilio or AWS SNS
    // For this mock, we will generate a 6-digit OTP and print it to the console
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[MOCK SMS] Sending OTP ${code} to ${data.phone}`);

    await this.prisma.otpToken.create({
      data: {
        phone: data.phone,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      }
    });

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(input: VerifyOtpInput) {
    const data = verifyOtpSchema.parse(input);
    const otp = await this.prisma.otpToken.findFirst({
      where: {
        phone: data.phone,
        code: data.code,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find user or create one
    let user = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: data.phone,
          role: UserRole.CUSTOMER,
        },
      });
      // Try sending welcome SMS (if we had an SMS service)
      console.log(`[MOCK SMS] Welcome to Sarangi Jewels! Sent to ${data.phone}`);
    }

    // Clean up used OTPs
    await this.prisma.otpToken.deleteMany({
      where: { phone: data.phone }
    });

    return this.issueTokens(user.id, user.email || user.phone || '', user.role);
  }

  private async issueTokens(userId: string, identifier: string, role: UserRole) {
    const payload = { sub: userId, email: identifier, role };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      data: {
        accessToken,
        refreshToken: accessToken,
        expiresIn: 900,
      },
    };
  }
}
