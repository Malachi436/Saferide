import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BusesService } from './buses.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('buses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Post()
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  create(@Body() createBusDto: any) {
    return this.busesService.create(createBusDto);
  }

  @Get()
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  findAll() {
    return this.busesService.findAll();
  }

  @Get('company/:companyId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  findByCompany(@Param('companyId') companyId: string) {
    return this.busesService.findByCompanyId(companyId);
  }

  @Get(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'DRIVER')
  findOne(@Param('id') id: string) {
    return this.busesService.findOne(id);
  }

  @Patch(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  update(@Param('id') id: string, @Body() updateBusDto: any) {
    return this.busesService.update(id, updateBusDto);
  }

  @Delete(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  remove(@Param('id') id: string) {
    return this.busesService.remove(id);
  }
}