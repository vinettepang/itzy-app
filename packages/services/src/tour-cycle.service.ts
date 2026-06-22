import type { Prisma, PrismaClient } from '@itzy-app/db';

const scheduleInclude = {
  tags: { include: { tag: true } },
  venue: true,
  tourCycle: true,
} as const;

export async function listTourCyclesAdmin(prisma: PrismaClient) {
  return prisma.tourCycle.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { _count: { select: { schedules: true } } },
  });
}

export async function createTourCycle(
  prisma: PrismaClient,
  input: { title: string; remark?: string | null; sortOrder?: number; featuredOnHome?: boolean },
) {
  const featured = Boolean(input.featuredOnHome);
  if (featured) {
    await prisma.tourCycle.updateMany({ data: { featuredOnHome: false } });
  }
  return prisma.tourCycle.create({
    data: {
      title: input.title.trim(),
      remark: input.remark != null && String(input.remark).trim() ? String(input.remark).trim() : null,
      sortOrder: input.sortOrder ?? 0,
      featuredOnHome: featured,
    },
    include: { _count: { select: { schedules: true } } },
  });
}

export async function updateTourCycle(
  prisma: PrismaClient,
  id: string,
  input: { title?: string; remark?: string | null; sortOrder?: number; featuredOnHome?: boolean },
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (input.featuredOnHome === true) {
      await tx.tourCycle.updateMany({ where: { NOT: { id } }, data: { featuredOnHome: false } });
    }
    return tx.tourCycle.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.remark !== undefined
          ? { remark: input.remark != null && String(input.remark).trim() ? String(input.remark).trim() : null }
          : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.featuredOnHome !== undefined ? { featuredOnHome: input.featuredOnHome } : {}),
      },
      include: { _count: { select: { schedules: true } } },
    });
  });
}

export async function deleteTourCycle(prisma: PrismaClient, id: string) {
  await prisma.tourCycle.delete({ where: { id } });
}

/** 首页「演唱会周期」：当前勾选首页的轮次下，优先下一场，否则最近一场已结束 */
export async function getHomeTourSpotlight(prisma: PrismaClient) {
  const cycle = await prisma.tourCycle.findFirst({
    where: { featuredOnHome: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  if (!cycle) {
    return { schedule: null, cycleTitle: null as string | null };
  }
  const now = new Date();
  const upcoming = await prisma.schedule.findFirst({
    where: { published: true, tourCycleId: cycle.id, startsAt: { gte: now } },
    orderBy: { startsAt: 'asc' },
    include: scheduleInclude,
  });
  if (upcoming) {
    return { schedule: upcoming, cycleTitle: cycle.title };
  }
  const past = await prisma.schedule.findFirst({
    where: { published: true, tourCycleId: cycle.id, startsAt: { lt: now } },
    orderBy: { startsAt: 'desc' },
    include: scheduleInclude,
  });
  return { schedule: past, cycleTitle: cycle.title };
}
