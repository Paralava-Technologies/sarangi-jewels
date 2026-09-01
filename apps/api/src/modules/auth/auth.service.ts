import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { registerSchema, loginSchema } from '@sarangi/validation';
import type { LoginInput, RegisterInput } from '@sarangi/validation';
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
    this.mailService.sendWelcomeEmail(user.email, user.firstName).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return this.issueTokens(user.id, user.email, user.role);
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

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  private async issueTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };
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
