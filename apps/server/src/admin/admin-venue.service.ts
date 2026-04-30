import { Injectable } from '@nestjs/common';
import { createVenue, deleteVenue, listVenuesAdmin, updateVenue } from '@itzy-app/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminVenueService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return listVenuesAdmin(this.prisma);
  }

  create(body: {
    countryCode: string;
    countryName: string;
    city: string;
    venueName: string;
    peopleCount?: number | null;
    remark?: string | null;
    posterDisplayName: string;
    sortOrder?: number;
  }) {
    return createVenue(this.prisma, body);
  }

  update(
    id: string,
    body: {
      countryCode?: string;
      countryName?: string;
      city?: string;
      venueName?: string;
      peopleCount?: number | null;
      remark?: string | null;
      posterDisplayName?: string;
      sortOrder?: number;
    },
  ) {
    return updateVenue(this.prisma, id, body);
  }

  async remove(id: string) {
    await deleteVenue(this.prisma, id);
  }
}
