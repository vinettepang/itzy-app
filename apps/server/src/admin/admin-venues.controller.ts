import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { fail, ok } from '../common/api';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AdminVenueService } from './admin-venue.service';

function normalizePeopleCount(v: unknown): { ok: false; msg: string } | { ok: true; value: number | null } {
  if (v === undefined || v === null || v === '') return { ok: true, value: null };
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    return { ok: false, msg: '人数须为非负整数或留空' };
  }
  return { ok: true, value: n };
}

@Controller('admin/venues')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminVenuesController {
  constructor(private readonly venues: AdminVenueService) {}

  @Get()
  async list() {
    const rows = await this.venues.list();
    return ok(rows);
  }

  @Post()
  async create(
    @Body()
    body: {
      countryCode?: string;
      countryName?: string;
      city?: string;
      venueName?: string;
      remark?: string | null;
      posterDisplayName?: string;
      sortOrder?: number;
      peopleCount?: number | null;
    },
  ) {
    if (!body?.countryCode?.trim() || !body?.countryName?.trim() || !body?.city?.trim()) {
      return fail('国家与城市必填', 400);
    }
    if (!body?.venueName?.trim() || !body?.posterDisplayName?.trim()) {
      return fail('场馆名与海报显示名必填', 400);
    }
    const pc = normalizePeopleCount(body.peopleCount);
    if (!pc.ok) return fail(pc.msg, 400);
    try {
      const row = await this.venues.create({
        countryCode: body.countryCode,
        countryName: body.countryName,
        city: body.city,
        venueName: body.venueName,
        peopleCount: pc.value,
        remark: body.remark,
        posterDisplayName: body.posterDisplayName,
        sortOrder: body.sortOrder,
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
      countryCode?: string;
      countryName?: string;
      city?: string;
      venueName?: string;
      remark?: string | null;
      posterDisplayName?: string;
      sortOrder?: number;
      peopleCount?: number | null;
    },
  ) {
    const patch = { ...body };
    if (Object.prototype.hasOwnProperty.call(body, 'peopleCount')) {
      const pc = normalizePeopleCount(body.peopleCount);
      if (!pc.ok) return fail(pc.msg, 400);
      patch.peopleCount = pc.value;
    }
    try {
      const row = await this.venues.update(id, patch);
      return ok(row);
    } catch {
      return fail('场馆不存在或更新失败', 404);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.venues.remove(id);
      return ok(true);
    } catch {
      return fail('场馆不存在', 404);
    }
  }
}
