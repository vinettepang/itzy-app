import { Module } from '@nestjs/common';
import { AlbumModule } from './album/album.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [PrismaModule, AuthModule, AlbumModule, AdminModule, ScheduleModule],
})
export class AppModule {}
