import { Injectable } from '@nestjs/common';
import { getPublishedAlbumById, listPublishedAlbumsWithPhotos } from '@itzy-app/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumService {
  constructor(private readonly prisma: PrismaService) {}

  listPublic() {
    return listPublishedAlbumsWithPhotos(this.prisma);
  }

  getPublicById(id: string) {
    return getPublishedAlbumById(this.prisma, id);
  }
}
