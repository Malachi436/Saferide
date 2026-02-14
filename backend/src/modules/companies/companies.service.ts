import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCompanies() {
    // Companies are no longer used - schools are independent
    throw new BadRequestException('Companies are no longer supported');
  }

  async getCompanyById(companyId: string) {
    // Companies are no longer used - schools are independent
    throw new BadRequestException('Companies are no longer supported');
  }
}
