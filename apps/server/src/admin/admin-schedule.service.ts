import { Injectable } from '@nestjs/common';
import {
  createSchedule,
  createTag,
  deleteSchedule,
  deleteTag,
  listSchedulesAdmin,
  listTags,
  updateSchedule,
  updateTag,
} from '@itzy-app/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  tagsList() {
    return listTags(this.prisma);
  }

  tagCreate(body: { name: string; sortOrder?: number }) {
    return createTag(this.prisma, body);
  }

  tagUpdate(id: string, body: { name?: string; sortOrder?: number }) {
    return updateTag(this.prisma, id, body);
  }

  async tagRemove(id: string) {
    await deleteTag(this.prisma, id);
  }

  schedulesList() {
    return listSchedulesAdmin(this.prisma);
  }

  scheduleCreate(body: {
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: string;
    endsAt?: string | null;
    published?: boolean;
    highlighted?: boolean;
    comebackOnHome?: boolean;
    sortOrder?: number;
    venueId?: string | null;
    tourCycleId?: string | null;
    coverUrl?: string | null;
    tagIds?: string[];
  }) {
    return createSchedule(this.prisma, {
      title: body.title,
      description: body.description,
      location: body.location,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      published: body.published,
      highlighted: body.highlighted,
      comebackOnHome: body.comebackOnHome,
      sortOrder: body.sortOrder,
      venueId: body.venueId,
      tourCycleId: body.tourCycleId,
      coverUrl: body.coverUrl,
      tagIds: body.tagIds,
    });
  }

  scheduleUpdate(
    id: string,
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
      venueId?: string | null;
      tourCycleId?: string | null;
      coverUrl?: string | null;
      tagIds?: string[];
    },
  ) {
    const { startsAt, endsAt, tagIds, venueId, tourCycleId, coverUrl, ...rest } = body;
    return updateSchedule(this.prisma, id, {
      ...rest,
      ...(startsAt !== undefined ? { startsAt: new Date(startsAt) } : {}),
      ...(endsAt !== undefined ? { endsAt: endsAt ? new Date(endsAt) : null } : {}),
      ...(venueId !== undefined ? { venueId } : {}),
      ...(tourCycleId !== undefined ? { tourCycleId } : {}),
      ...(coverUrl !== undefined ? { coverUrl } : {}),
      ...(tagIds !== undefined ? { tagIds } : {}),
    });
  }

  scheduleUploadCover(id: string, url: string) {
    return updateSchedule(this.prisma, id, { coverUrl: url });
  }

  async scheduleRemove(id: string) {
    await deleteSchedule(this.prisma, id);
  }
}
