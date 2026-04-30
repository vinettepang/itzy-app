import type { PrismaClient } from '@itzy-app/db';

/** 与 `schema.prisma` 中 Venue 一致；在 Prisma Client 已 generate 时与 DB 对齐 */
export type VenueRecord = {
  id: string;
  countryCode: string;
  countryName: string;
  city: string;
  venueName: string;
  peopleCount: number | null;
  remark: string | null;
  posterDisplayName: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

type VenueDelegate = {
  findMany: (args: object) => Promise<VenueRecord[]>;
  create: (args: { data: object }) => Promise<VenueRecord>;
  update: (args: { where: { id: string }; data: object }) => Promise<VenueRecord>;
  delete: (args: { where: { id: string } }) => Promise<VenueRecord>;
  findUniqueOrThrow: (args: { where: { id: string } }) => Promise<VenueRecord>;
};

function venueOf(prisma: PrismaClient): VenueDelegate {
  return (prisma as unknown as { venue: VenueDelegate }).venue;
}

export async function listVenuesAdmin(prisma: PrismaClient): Promise<VenueRecord[]> {
  return venueOf(prisma).findMany({
    orderBy: [{ countryName: 'asc' }, { city: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function createVenue(
  prisma: PrismaClient,
  input: {
    countryCode: string;
    countryName: string;
    city: string;
    venueName: string;
    peopleCount?: number | null;
    remark?: string | null;
    posterDisplayName: string;
    sortOrder?: number;
  },
): Promise<VenueRecord> {
  return venueOf(prisma).create({
    data: {
      countryCode: input.countryCode.trim(),
      countryName: input.countryName.trim(),
      city: input.city.trim(),
      venueName: input.venueName.trim(),
      peopleCount: input.peopleCount ?? null,
      remark: input.remark?.trim() || null,
      posterDisplayName: input.posterDisplayName.trim(),
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateVenue(
  prisma: PrismaClient,
  id: string,
  input: {
    countryCode?: string;
    countryName?: string;
    city?: string;
    venueName?: string;
    peopleCount?: number | null;
    remark?: string | null;
    posterDisplayName?: string;
    sortOrder?: number;
  },
): Promise<VenueRecord> {
  const data: Record<string, unknown> = {};
  if (input.countryCode !== undefined) data.countryCode = input.countryCode.trim();
  if (input.countryName !== undefined) data.countryName = input.countryName.trim();
  if (input.city !== undefined) data.city = input.city.trim();
  if (input.venueName !== undefined) data.venueName = input.venueName.trim();
  if (input.peopleCount !== undefined) data.peopleCount = input.peopleCount;
  if (input.remark !== undefined) data.remark = input.remark?.trim() || null;
  if (input.posterDisplayName !== undefined) data.posterDisplayName = input.posterDisplayName.trim();
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (Object.keys(data).length === 0) {
    return venueOf(prisma).findUniqueOrThrow({ where: { id } });
  }
  return venueOf(prisma).update({ where: { id }, data });
}

export async function deleteVenue(prisma: PrismaClient, id: string): Promise<void> {
  await venueOf(prisma).delete({ where: { id } });
}
