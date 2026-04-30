import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { fail, ok } from '../common/api';
import { AdminTourCycleService } from './admin-tour-cycle.service';

@Controller('admin/tour-cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTourCyclesController {
  constructor(private readonly tourCycles: AdminTourCycleService) {}

  @Get()
  async list() {
    const rows = await this.tourCycles.list();
    return ok(rows);
  }

  @Post()
  async create(
    @Body()
    body: {
      title?: string;
      remark?: string | null;
      sortOrder?: number;
      featuredOnHome?: boolean;
    },
  ) {
    if (!body?.title?.trim()) {
      return fail('title 必填', 400);
    }
    try {
      const row = await this.tourCycles.create({
        title: body.title,
        remark: body.remark,
        sortOrder: body.sortOrder,
        featuredOnHome: body.featuredOnHome,
      });
      return ok(row);
    } catch {
      return fail('创建失败', 400);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      remark?: string | null;
      sortOrder?: number;
      featuredOnHome?: boolean;
    },
  ) {
    try {
      const row = await this.tourCycles.update(id, body);
      return ok(row);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('P2025') || msg.includes('Record to update not found')) {
        return fail('轮次不存在', 404);
      }
      return fail(msg.length > 200 ? `${msg.slice(0, 200)}…` : msg, 400);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.tourCycles.remove(id);
      return ok(true);
    } catch {
      return fail('轮次不存在', 404);
    }
  }
}
