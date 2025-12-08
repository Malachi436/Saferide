import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService, private prisma: PrismaService) {}

  @Post()
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT')
  create(@Body() createChildDto: any) {
    return this.childrenService.create(createChildDto);
  }

  @Get()
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  findAll() {
    return this.childrenService.findAll();
  }

  @Get(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT')
  findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }

  @Get('parent/:parentId')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT')
  findByParent(@Param('parentId') parentId: string) {
    return this.childrenService.findByParentId(parentId);
  }

  @Patch(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN', 'PARENT')
  update(@Param('id') id: string, @Body() updateChildDto: any) {
    return this.childrenService.update(id, updateChildDto);
  }

  @Delete(':id')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  remove(@Param('id') id: string) {
    return this.childrenService.remove(id);
  }

  @Get('public/schools')
  @Roles('PARENT', 'PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async getSchools() {
    return this.prisma.school.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });
  }
}