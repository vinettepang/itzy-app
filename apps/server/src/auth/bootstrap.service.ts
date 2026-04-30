import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { countTags, countUsers, createUser, seedDefaultTags } from '@itzy-app/services';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_EMAIL = 'admin@itzy.local';
const DEFAULT_PASSWORD = 'Admin123456';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly log = new Logger(BootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedTagsIfEmpty();

    if (process.env.SKIP_DEFAULT_ADMIN === 'true') {
      return;
    }
    let n: number;
    try {
      n = await countUsers(this.prisma);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const likelyNoTables =
        msg.includes('no such table') ||
        msg.includes("doesn't exist") ||
        msg.includes('Unknown table') ||
        msg.includes('does not exist in the current database') ||
        /P2021|P1003/i.test(msg);
      if (likelyNoTables) {
        this.log.error(
          'Prisma 无法访问 User 表（常见原因：MySQL 未建库/未执行 schema 同步）。' +
            '请确认 DATABASE_URL 指向的库已创建，并在仓库根执行: pnpm run db:push（首次建议 pnpm run db:sync）',
        );
      }
      throw e;
    }
    if (n > 0) {
      return;
    }
    const email = (process.env.DEFAULT_SUPER_ADMIN_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();
    const password = process.env.DEFAULT_SUPER_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
    if (password.length < 6) {
      this.log.warn('DEFAULT_SUPER_ADMIN_PASSWORD too short; skip default admin creation');
      return;
    }
    await createUser(this.prisma, {
      email,
      password,
      name: '超级管理员',
      role: 'SUPER_ADMIN',
    });
    this.log.warn(
      `空库已创建默认超级管理员：邮箱 ${email}。` +
        `默认密码见环境变量 DEFAULT_SUPER_ADMIN_PASSWORD（未设置时为开发用固定值）。` +
        `登录后请立即修改密码；生产环境请设置强密码并勿提交 .env。`,
    );
  }

  /** 无标签时写入默认分类（演唱会、回归、签售等），便于行程管理开箱即用 */
  private async seedTagsIfEmpty() {
    try {
      const n = await countTags(this.prisma);
      if (n === 0) {
        await seedDefaultTags(this.prisma);
        this.log.log('已创建默认行程标签');
      }
    } catch {
      /* Tag 表不存在时忽略（未完成 db push） */
    }
  }
}
