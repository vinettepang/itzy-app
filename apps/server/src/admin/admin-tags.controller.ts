import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { fail, ok } from '../common/api';
import { AdminScheduleService } from './admin-schedule.service';

@Controller('admin/tags')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTagsController {
  constructor(private readonly scheduleAdmin: AdminScheduleService) {}

  @Get()
  async list() {
    const rows = await this.scheduleAdmin.tagsList();
    return ok(rows);
  }

  @Post()
  async create(@Body() body: { name?: string; sortOrder?: number }) {
    if (!body?.name?.trim()) {
      return fail('name is required', 400);
    }
    try {
      const row = await this.scheduleAdmin.tagCreate({ name: body.name, sortOrder: body.sortOrder });
      return ok(row);
    } catch {
      return fail('标签名称可能已存在', 409);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string; sortOrder?: number }) {
    try {
      const row = await this.scheduleAdmin.tagUpdate(id, body);
      return ok(row);
    } catch {
      return fail('标签不存在或名称冲突', 404);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.scheduleAdmin.tagRemove(id);
      return ok(true);
    } catch {
      return fail('标签不存在', 404);
    }
  }
}
