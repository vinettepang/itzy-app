import type { PrismaClient } from '@itzy-app/db';
import { getHomeTourSpotlight } from './tour-cycle.service';

const scheduleInclude = {
  tags: { include: { tag: true } },
  venue: true,
  tourCycle: true,
} as const;

export async function listTags(prisma: PrismaClient) {
  return prisma.tag.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
}

export async function createTag(prisma: PrismaClient, input: { name: string; sortOrder?: number }) {
  return prisma.tag.create({
    data: {
      name: input.name.trim(),
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateTag(prisma: PrismaClient, id: string, input: { name?: string; sortOrder?: number }) {
  return prisma.tag.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });
}

export async function deleteTag(prisma: PrismaClient, id: string) {
  await prisma.tag.delete({ where: { id } });
}

export async function setScheduleTags(prisma: PrismaClient, scheduleId: string, tagIds: string[]) {
  const unique = [...new Set(tagIds.filter(Boolean))];
  await prisma.scheduleTag.deleteMany({ where: { scheduleId } });
  if (unique.length) {
    await prisma.scheduleTag.createMany({
      data: unique.map((tagId) => ({ scheduleId, tagId })),
      skipDuplicates: true,
    });
  }
}

export async function listSchedulesAdmin(prisma: PrismaClient) {
  return prisma.schedule.findMany({
    orderBy: [{ startsAt: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: scheduleInclude,
  });
}

export async function listSchedulesPublished(prisma: PrismaClient) {
  return prisma.schedule.findMany({
    where: { published: true },
    orderBy: [{ startsAt: 'asc' }, { sortOrder: 'asc' }],
    include: scheduleInclude,
  });
}

/** 小程序首页：当日行程 + 非当日「首页精选」+ 独立「回归日程」 */
export async function getSchedulesHomeSections(prisma: PrismaClient, featuredLimit = 20) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const cap = Math.min(50, Math.max(1, featuredLimit));

  const [todayRows, featured, comeback, tourPack] = await Promise.all([
    prisma.schedule.findMany({
      where: {
        published: true,
        startsAt: { gte: startOfToday, lt: endOfToday },
      },
      orderBy: [{ startsAt: 'asc' }],
      include: scheduleInclude,
    }),
    prisma.schedule.findMany({
      where: {
        published: true,
        highlighted: true,
        OR: [{ startsAt: { lt: startOfToday } }, { startsAt: { gte: endOfToday } }],
      } as never,
      orderBy: [{ startsAt: 'asc' }],
      take: cap,
      include: scheduleInclude,
    }),
    prisma.schedule.findMany({
      where: {
        published: true,
        comebackOnHome: true,
      },
      orderBy: [{ startsAt: 'asc' }],
      take: cap,
      include: scheduleInclude,
    }),
    getHomeTourSpotlight(prisma),
  ]);

  const today = [...todayRows].sort((a, b) => {
    const byHighlight = Number(b.highlighted) - Number(a.highlighted);
    if (byHighlight !== 0) return byHighlight;
    return a.startsAt.getTime() - b.startsAt.getTime();
  });

  return {
    today,
    featured,
    comeback,
    tourSpotlight: tourPack.schedule,
    tourSpotlightCycleTitle: tourPack.cycleTitle,
  };
}

export async function createSchedule(
  prisma: PrismaClient,
  input: {
    title: string;
    description?: string | null;
    location?: string | null;
    startsAt: Date;
    endsAt?: Date | null;
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
  const venueId =
    input.venueId !== undefined && input.venueId !== null && String(input.venueId).trim()
      ? String(input.venueId).trim()
      : null;
  const tourCycleId =
    input.tourCycleId !== undefined && input.tourCycleId !== null && String(input.tourCycleId).trim()
      ? String(input.tourCycleId).trim()
      : null;
  const coverUrl =
    input.coverUrl !== undefined && input.coverUrl !== null && String(input.coverUrl).trim()
      ? String(input.coverUrl).trim()
      : null;
  const row = await prisma.schedule.create({
    data: {
      title: input.title.trim(),
      description: input.description ?? null,
      location: input.location ?? null,
      coverUrl,
      startsAt: input.startsAt,
      endsAt: input.endsAt ?? null,
      published: input.published ?? false,
      highlighted: input.highlighted ?? false,
      comebackOnHome: input.comebackOnHome ?? false,
      sortOrder: input.sortOrder ?? 0,
      venueId,
      tourCycleId,
    } as never,
  });
  if (input.tagIds?.length) {
    await setScheduleTags(prisma, row.id, input.tagIds);
  }
  return prisma.schedule.findUniqueOrThrow({
    where: { id: row.id },
    include: scheduleInclude,
  });
}

export async function updateSchedule(
  prisma: PrismaClient,
  id: string,
  input: {
    title?: string;
    description?: string | null;
    location?: string | null;
    startsAt?: Date;
    endsAt?: Date | null;
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
  const { tagIds, ...rest } = input;
  const data = {
    ...(rest.title !== undefined ? { title: rest.title.trim() } : {}),
    ...(rest.description !== undefined ? { description: rest.description } : {}),
    ...(rest.location !== undefined ? { location: rest.location } : {}),
    ...(rest.startsAt !== undefined ? { startsAt: rest.startsAt } : {}),
    ...(rest.endsAt !== undefined ? { endsAt: rest.endsAt } : {}),
    ...(rest.published !== undefined ? { published: rest.published } : {}),
    ...(rest.highlighted !== undefined ? { highlighted: rest.highlighted } : {}),
    ...(rest.comebackOnHome !== undefined ? { comebackOnHome: rest.comebackOnHome } : {}),
    ...(rest.sortOrder !== undefined ? { sortOrder: rest.sortOrder } : {}),
    ...(rest.venueId !== undefined
      ? {
          venueId:
            rest.venueId !== null && String(rest.venueId).trim() ? String(rest.venueId).trim() : null,
        }
      : {}),
    ...(rest.tourCycleId !== undefined
      ? {
          tourCycleId:
            rest.tourCycleId !== null && String(rest.tourCycleId).trim() ? String(rest.tourCycleId).trim() : null,
        }
      : {}),
    ...(rest.coverUrl !== undefined
      ? {
          coverUrl:
            rest.coverUrl !== null && String(rest.coverUrl).trim() ? String(rest.coverUrl).trim() : null,
        }
      : {}),
  };
  if (Object.keys(data).length > 0) {
    await prisma.schedule.update({ where: { id }, data: data as never });
  }
  if (tagIds !== undefined) {
    await setScheduleTags(prisma, id, tagIds);
  }
  return prisma.schedule.findUniqueOrThrow({
    where: { id },
    include: scheduleInclude,
  });
}

export async function deleteSchedule(prisma: PrismaClient, id: string) {
  await prisma.schedule.delete({ where: { id } });
}

export async function countTags(prisma: PrismaClient) {
  return prisma.tag.count();
}

export async function seedDefaultTags(prisma: PrismaClient) {
  const names = ['演唱会', '回归', '签售', '综艺', '直播', '其他'];
  await prisma.tag.createMany({
    data: names.map((name, i) => ({ name, sortOrder: i })),
    skipDuplicates: true,
  });
}
