import { Controller, Get, Param, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompaniesService } from './companies.service';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @Roles('PLATFORM_ADMIN')
  async getAllCompanies() {
    return this.companiesService.getAllCompanies();
  }

  @Get(':companyId')
  @Roles('PLATFORM_ADMIN')
  async getCompanyById(@Param('companyId') companyId: string, @Req() req: any) {
    throw new BadRequestException('Companies are no longer supported');
  }
}
