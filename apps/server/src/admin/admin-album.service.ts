import { Injectable } from '@nestjs/common';
import {
  addPhoto as addPhotoRecord,
  createAlbum,
  deleteAlbum,
  deletePhoto,
  listAllAlbums,
  updateAlbum,
} from '@itzy-app/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAlbumService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return listAllAlbums(this.prisma);
  }

  create(body: { title: string; description?: string | null; published?: boolean; sortOrder?: number }) {
    return createAlbum(this.prisma, body);
  }

  update(
    id: string,
    body: {
      title?: string;
      description?: string | null;
      coverUrl?: string | null;
      published?: boolean;
      sortOrder?: number;
    },
  ) {
    return updateAlbum(this.prisma, id, body);
  }

  remove(id: string) {
    return deleteAlbum(this.prisma, id);
  }

  addPhoto(albumId: string, url: string, caption?: string | null) {
    return addPhotoRecord(this.prisma, albumId, { url, caption });
  }

  removePhoto(photoId: string) {
    return deletePhoto(this.prisma, photoId);
  }
}
