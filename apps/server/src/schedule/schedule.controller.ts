import { Controller, Get, Query } from '@nestjs/common';
import { ok } from '../common/api';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly schedules: ScheduleService) {}

  /** 小程序首页：{ today, featured, comeback, tourSpotlight, tourSpotlightCycleTitle } */
  @Get('home')
  async home(@Query('limit') limit?: string) {
    const n = Math.min(50, Math.max(1, parseInt(limit ?? '20', 10) || 20));
    const sections = await this.schedules.listHome(n);
    return ok(sections);
  }

  @Get()
  async list() {
    const rows = await this.schedules.listPublished();
    return ok(rows);
  }
}
