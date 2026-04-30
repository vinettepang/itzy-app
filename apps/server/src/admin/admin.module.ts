import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/roles.guard';
import { AdminAlbumController } from './admin-album.controller';
import { AdminAlbumService } from './admin-album.service';
import { AdminSchedulesController } from './admin-schedules.controller';
import { AdminScheduleService } from './admin-schedule.service';
import { AdminVenueService } from './admin-venue.service';
import { AdminVenuesController } from './admin-venues.controller';
import { AdminTourCyclesController } from './admin-tour-cycles.controller';
import { AdminTourCycleService } from './admin-tour-cycle.service';
import { AdminTagsController } from './admin-tags.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminAlbumController,
    AdminUsersController,
    AdminTagsController,
    AdminSchedulesController,
    AdminVenuesController,
    AdminTourCyclesController,
  ],
  providers: [
    AdminAlbumService,
    AdminUsersService,
    AdminScheduleService,
    AdminVenueService,
    AdminTourCycleService,
    RolesGuard,
  ],
})
export class AdminModule {}
