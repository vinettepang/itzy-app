import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  countUsers,
  createUser,
  findUserByEmail,
  findUserById,
  verifyUserPassword,
} from '@itzy-app/services';
import { JwtPayload } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await verifyUserPassword(this.prisma, email, password);
    if (!user) {
      return null;
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async register(input: { email: string; password: string; name?: string | null }) {
    const n = await countUsers(this.prisma);
    if (n > 0 && process.env.ALLOW_PUBLIC_REGISTER !== 'true') {
      throw new ForbiddenException('公开注册已关闭；请由超级管理员在后台创建账号。');
    }
    const existing = await findUserByEmail(this.prisma, input.email);
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }
    const role = n === 0 ? 'SUPER_ADMIN' : 'ADMIN';
    return createUser(this.prisma, {
      email: input.email,
      password: input.password,
      name: input.name,
      role,
    });
  }

  async me(userId: string) {
    const u = await findUserById(this.prisma, userId);
    if (!u) {
      return null;
    }
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  }
}
