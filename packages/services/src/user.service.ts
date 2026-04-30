import type { PrismaClient } from '@itzy-app/db';
import * as bcrypt from 'bcryptjs';

export async function countUsers(prisma: PrismaClient) {
  return prisma.user.count();
}

export async function findUserByEmail(prisma: PrismaClient, email: string) {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
}

export async function findUserById(prisma: PrismaClient, id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function verifyUserPassword(prisma: PrismaClient, email: string, password: string) {
  const user = await findUserByEmail(prisma, email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function createUser(
  prisma: PrismaClient,
  input: { email: string; password: string; name?: string | null; role?: string },
) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      email: normalizeEmail(input.email),
      passwordHash,
      name: input.name?.trim() || null,
      role: input.role ?? 'ADMIN',
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
}

export async function listUsers(prisma: PrismaClient) {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
}

export async function updateUser(
  prisma: PrismaClient,
  id: string,
  input: { name?: string | null; role?: string; password?: string },
) {
  const data: {
    name?: string | null;
    role?: string;
    passwordHash?: string;
  } = {};
  if (input.name !== undefined) data.name = input.name?.trim() || null;
  if (input.role !== undefined) data.role = input.role;
  if (input.password?.length) {
    data.passwordHash = await bcrypt.hash(input.password, 10);
  }
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
}

export async function deleteUser(prisma: PrismaClient, id: string) {
  await prisma.user.delete({ where: { id } });
}
