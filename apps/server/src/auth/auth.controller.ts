import { Body, ConflictException, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { countUsers } from '@itzy-app/services';
import { fail, ok } from '../common/api';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('bootstrap')
  async bootstrap() {
    const n = await countUsers(this.prisma);
    return ok({ needsRegistration: n === 0 });
  }

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    if (!body?.email?.trim() || !body?.password) {
      return fail('请填写邮箱与密码', 400);
    }
    const row = await this.auth.login(body.email, body.password);
    if (!row) {
      return fail('邮箱或密码错误', 401);
    }
    return ok(row);
  }

  @Post('register')
  async register(@Body() body: { email?: string; password?: string; name?: string | null }) {
    if (!body?.email?.trim() || !body?.password || body.password.length < 6) {
      return fail('邮箱必填，密码至少 6 位', 400);
    }
    try {
      const row = await this.auth.register({
        email: body.email,
        password: body.password,
        name: body.name,
      });
      return ok(row);
    } catch (e: unknown) {
      if (e instanceof ForbiddenException) {
        return fail(e.message, 403);
      }
      if (e instanceof ConflictException) {
        return fail(e.message, 409);
      }
      return fail('注册失败', 400);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const uid = req.user?.userId;
    if (!uid) {
      return fail('Unauthorized', 401);
    }
    const data = await this.auth.me(uid);
    if (!data) {
      return fail('用户不存在', 404);
    }
    return ok(data);
  }
}
