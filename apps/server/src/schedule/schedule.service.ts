import { Injectable } from '@nestjs/common';
import { getSchedulesHomeSections, listSchedulesPublished } from '@itzy-app/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  listPublished() {
    return listSchedulesPublished(this.prisma);
  }

  listHome(featuredLimit: number) {
    return getSchedulesHomeSections(this.prisma, featuredLimit);
  }
}
