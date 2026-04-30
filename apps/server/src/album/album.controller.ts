import { Controller, Get, Param } from '@nestjs/common';
import { AlbumService } from './album.service';
import { fail, ok } from '../common/api';

@Controller('albums')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get()
  async list() {
    const rows = await this.albumService.listPublic();
    return ok(rows);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const row = await this.albumService.getPublicById(id);
    if (!row) {
      return fail('Album not found', 404);
    }
    return ok(row);
  }
}
