import type { PrismaClient } from '@itzy-app/db';

export async function listPublishedAlbumsWithPhotos(prisma: PrismaClient) {
  return prisma.album.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      photos: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });
}

export async function getPublishedAlbumById(prisma: PrismaClient, id: string) {
  return prisma.album.findFirst({
    where: { id, published: true },
    include: {
      photos: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });
}

export async function listAllAlbums(prisma: PrismaClient) {
  return prisma.album.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      photos: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });
}

export async function createAlbum(
  prisma: PrismaClient,
  input: { title: string; description?: string | null; published?: boolean; sortOrder?: number },
) {
  return prisma.album.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      published: input.published ?? false,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateAlbum(
  prisma: PrismaClient,
  id: string,
  input: {
    title?: string;
    description?: string | null;
    coverUrl?: string | null;
    published?: boolean;
    sortOrder?: number;
  },
) {
  return prisma.album.update({
    where: { id },
    data: input,
  });
}

export async function deleteAlbum(prisma: PrismaClient, id: string) {
  await prisma.album.delete({ where: { id } });
}

export async function addPhoto(
  prisma: PrismaClient,
  albumId: string,
  input: { url: string; caption?: string | null; sortOrder?: number },
) {
  const photo = await prisma.photo.create({
    data: {
      albumId,
      url: input.url,
      caption: input.caption ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (album && !album.coverUrl) {
    await prisma.album.update({
      where: { id: albumId },
      data: { coverUrl: input.url },
    });
  }
  return photo;
}

export async function deletePhoto(prisma: PrismaClient, photoId: string) {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return;
  const albumId = photo.albumId;
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  await prisma.photo.delete({ where: { id: photoId } });
  if (album?.coverUrl === photo.url) {
    const next = await prisma.photo.findFirst({
      where: { albumId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    await prisma.album.update({
      where: { id: albumId },
      data: { coverUrl: next?.url ?? null },
    });
  }
}
