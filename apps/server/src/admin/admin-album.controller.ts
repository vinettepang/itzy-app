import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AdminAlbumService } from './admin-album.service';
import { fail, ok } from '../common/api';

@Controller('admin/albums')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminAlbumController {
  constructor(private readonly adminAlbum: AdminAlbumService) {}

  @Get()
  async list() {
    const rows = await this.adminAlbum.list();
    return ok(rows);
  }

  @Post()
  async create(
    @Body()
    body: { title: string; description?: string | null; published?: boolean; sortOrder?: number },
  ) {
    if (!body?.title?.trim()) {
      return fail('title is required', 400);
    }
    const row = await this.adminAlbum.create(body);
    return ok(row);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string | null;
      coverUrl?: string | null;
      published?: boolean;
      sortOrder?: number;
    },
  ) {
    try {
      const row = await this.adminAlbum.update(id, body);
      return ok(row);
    } catch {
      return fail('Album not found', 404);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.adminAlbum.remove(id);
      return ok(true);
    } catch {
      return fail('Album not found', 404);
    }
  }

  @Post(':id/photos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = join(process.cwd(), 'uploads');
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.bin';
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  async uploadPhoto(
    @Param('id') albumId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    if (!file) {
      return fail('file is required', 400);
    }
    const url = `/uploads/${file.filename}`;
    try {
      const photo = await this.adminAlbum.addPhoto(albumId, url, caption ?? null);
      return ok(photo);
    } catch {
      return fail('Album not found', 404);
    }
  }

  @Delete('photos/:photoId')
  async removePhoto(@Param('photoId') photoId: string) {
    await this.adminAlbum.removePhoto(photoId);
    return ok(true);
  }
}
