import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { fail, ok } from '../common/api';
import { AdminScheduleService } from './admin-schedule.service';

@Controller('admin/schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminSchedulesController {
  constructor(private readonly scheduleAdmin: AdminScheduleService) {}

  @Get()
  async list() {
    const rows = await this.scheduleAdmin.schedulesList();
    return ok(rows);
  }

  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, join(process.cwd(), 'uploads'));
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.bin';
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  async uploadCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return fail('file is required', 400);
    }
    /** 只存路径，避免默认 LAN IP 与客户端实际 API 主机不一致导致图片无法加载 */
    const url = `/uploads/${file.filename}`;
    try {
      const row = await this.scheduleAdmin.scheduleUploadCover(id, url);
      return ok(row);
    } catch {
      return fail('行程不存在', 404);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      title?: string;
      description?: string | null;
      location?: string | null;
      startsAt?: string;
      endsAt?: string | null;
      published?: boolean;
      highlighted?: boolean;
      comebackOnHome?: boolean;
      sortOrder?: number;
      tagIds?: string[];
      venueId?: string | null;
      tourCycleId?: string | null;
      coverUrl?: string | null;
    },
  ) {
    if (!body?.title?.trim() || !body?.startsAt) {
      return fail('title 与 startsAt 必填', 400);
    }
    const t = new Date(body.startsAt);
    if (Number.isNaN(t.getTime())) {
      return fail('startsAt 不是有效时间', 400);
    }
    if (body.endsAt) {
      const e = new Date(body.endsAt);
      if (Number.isNaN(e.getTime())) {
        return fail('endsAt 不是有效时间', 400);
      }
    }
    try {
      const row = await this.scheduleAdmin.scheduleCreate({
        title: body.title,
        description: body.description,
        location: body.location,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        published: body.published,
        highlighted: body.highlighted,
        comebackOnHome: body.comebackOnHome,
        sortOrder: body.sortOrder,
        venueId: body.venueId,
        tourCycleId: body.tourCycleId,
        coverUrl: body.coverUrl,
        tagIds: body.tagIds,
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
      description?: string | null;
      location?: string | null;
      startsAt?: string;
      endsAt?: string | null;
      published?: boolean;
      highlighted?: boolean;
      comebackOnHome?: boolean;
      sortOrder?: number;
      tagIds?: string[];
      venueId?: string | null;
      tourCycleId?: string | null;
      coverUrl?: string | null;
    },
  ) {
    if (body.startsAt !== undefined) {
      const t = new Date(body.startsAt);
      if (Number.isNaN(t.getTime())) {
        return fail('startsAt 不是有效时间', 400);
      }
    }
    if (body.endsAt !== undefined && body.endsAt !== null && body.endsAt !== '') {
      const e = new Date(body.endsAt);
      if (Number.isNaN(e.getTime())) {
        return fail('endsAt 不是有效时间', 400);
      }
    }
    try {
      const row = await this.scheduleAdmin.scheduleUpdate(id, body);
      return ok(row);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('P2025') || msg.includes('Record to update not found')) {
        return fail('行程不存在', 404);
      }
      if (msg.includes('Foreign key constraint') || msg.includes('P2003')) {
        return fail('标签或场馆不存在或已被删除，请重新选择', 400);
      }
      return fail(msg.length > 200 ? `${msg.slice(0, 200)}…` : msg, 400);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.scheduleAdmin.scheduleRemove(id);
      return ok(true);
    } catch {
      return fail('行程不存在', 404);
    }
  }
}
