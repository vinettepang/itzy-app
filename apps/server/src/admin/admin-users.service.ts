import { Injectable } from '@nestjs/common';
import { createUser, deleteUser, listUsers, updateUser } from '@itzy-app/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return listUsers(this.prisma);
  }

  create(body: { email: string; password: string; name?: string | null; role?: string }) {
    return createUser(this.prisma, {
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role ?? 'ADMIN',
    });
  }

  update(
    id: string,
    body: { name?: string | null; role?: string; password?: string },
  ) {
    return updateUser(this.prisma, id, body);
  }

  remove(id: string) {
    return deleteUser(this.prisma, id);
  }
}
