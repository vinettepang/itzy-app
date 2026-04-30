import { Injectable } from '@nestjs/common';
import { createTourCycle, deleteTourCycle, listTourCyclesAdmin, updateTourCycle } from '@itzy-app/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminTourCycleService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return listTourCyclesAdmin(this.prisma);
  }

  create(body: { title: string; remark?: string | null; sortOrder?: number; featuredOnHome?: boolean }) {
    return createTourCycle(this.prisma, body);
  }

  update(
    id: string,
    body: { title?: string; remark?: string | null; sortOrder?: number; featuredOnHome?: boolean },
  ) {
    return updateTourCycle(this.prisma, id, body);
  }

  async remove(id: string) {
    await deleteTourCycle(this.prisma, id);
  }
}
