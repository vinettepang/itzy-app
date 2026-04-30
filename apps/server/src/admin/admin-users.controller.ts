import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { fail, ok } from '../common/api';
import { AdminUsersService } from './admin-users.service';

function isValidRole(r: string | undefined) {
  return r === 'ADMIN' || r === 'SUPER_ADMIN';
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  async list() {
    const rows = await this.users.list();
    return ok(rows);
  }

  @Post()
  async create(
    @Body()
    body: { email?: string; password?: string; name?: string | null; role?: string },
  ) {
    if (!body?.email?.trim() || !body?.password || body.password.length < 6) {
      return fail('邮箱必填，密码至少 6 位', 400);
    }
    if (body.role && !isValidRole(body.role)) {
      return fail('role 必须为 ADMIN 或 SUPER_ADMIN', 400);
    }
    try {
      const row = await this.users.create({
        email: body.email,
        password: body.password,
        name: body.name,
        role: body.role,
      });
      return ok(row);
    } catch {
      return fail('邮箱可能已存在', 409);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string | null; role?: string; password?: string },
  ) {
    if (body.role && !isValidRole(body.role)) {
      return fail('role 必须为 ADMIN 或 SUPER_ADMIN', 400);
    }
    try {
      const row = await this.users.update(id, body);
      return ok(row);
    } catch {
      return fail('用户不存在', 404);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    if (id === req.user?.userId) {
      return fail('不能删除当前登录账号', 400);
    }
    try {
      await this.users.remove(id);
      return ok(true);
    } catch {
      return fail('用户不存在', 404);
    }
  }
}
