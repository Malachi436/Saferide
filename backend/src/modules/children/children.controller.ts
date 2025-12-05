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

  // Get unassigned children for a school (for parent to select during onboarding)
  @Get('school/:schoolId/available')
  @Roles('PARENT')
  async getAvailableChildrenBySchool(@Param('schoolId') schoolId: string) {
    return this.childrenService.getUnassignedChildrenBySchool(schoolId);
  }

  // Assign existing child to parent with pickup details
  @Post(':childId/assign')
  @Roles('PARENT')
  async assignChildToParent(
    @Param('childId') childId: string,
    @Body() data: any,
  ) {
    return this.childrenService.assignChildToParent(childId, data.parentId, data);
  }

  // Create payment subscription for a child
  @Post(':childId/subscribe-plan')
  @Roles('PARENT')
  async subscribeToPaymentPlan(
    @Param('childId') childId: string,
    @Body() data: any,
  ) {
    return this.childrenService.createPaymentSubscription(
      childId,
      data.parentId,
      data.planId,
    );
  }

  // Get days until payment due for a child
  @Get(':childId/payment-days-remaining')
  @Roles('PARENT')
  async getDaysUntilPaymentDue(@Param('childId') childId: string) {
    const daysRemaining = await this.childrenService.getDaysUntilPaymentDue(childId);
    return { childId, daysRemaining };
  }
}