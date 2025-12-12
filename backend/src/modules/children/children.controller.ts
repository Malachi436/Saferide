import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { LinkChildDto, BulkUpdateGradesDto } from './dto/link-child.dto';
import { RequestLocationChangeDto, ReviewLocationChangeDto } from './dto/location-change.dto';

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

  // Link child to parent using unique code
  @Post('link')
  @Roles('PARENT')
  linkChild(@Req() req: any, @Body() linkDto: LinkChildDto) {
    const parentId = req.user.userId;
    return this.childrenService.linkChildToParent(parentId, linkDto);
  }

  // Generate unique code for child (Admin only)
  @Post('generate-code')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  async generateCode() {
    const code = await this.childrenService.generateUniqueCode();
    return { uniqueCode: code };
  }

  // Bulk update grades (Annual promotions)
  @Post('company/:companyId/bulk-update-grades')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  bulkUpdateGrades(
    @Param('companyId') companyId: string,
    @Body() updateDto: BulkUpdateGradesDto,
    @Req() req: any,
  ) {
    const adminId = req.user.userId;
    return this.childrenService.bulkUpdateGrades(companyId, updateDto, adminId);
  }

  // Request location change (Parent)
  @Post('location-change/request')
  @Roles('PARENT')
  requestLocationChange(@Req() req: any, @Body() requestDto: RequestLocationChangeDto) {
    const parentId = req.user.userId;
    return this.childrenService.requestLocationChange(parentId, requestDto);
  }

  // Get pending location change requests (Admin)
  @Get('company/:companyId/location-change/pending')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  getPendingLocationChangeRequests(@Param('companyId') companyId: string) {
    return this.childrenService.getPendingLocationChangeRequests(companyId);
  }

  // Review location change request (Admin)
  @Patch('location-change/:requestId/review')
  @Roles('PLATFORM_ADMIN', 'COMPANY_ADMIN')
  reviewLocationChangeRequest(
    @Param('requestId') requestId: string,
    @Body() reviewDto: ReviewLocationChangeDto,
    @Req() req: any,
  ) {
    const adminId = req.user.userId;
    return this.childrenService.reviewLocationChangeRequest(requestId, adminId, reviewDto);
  }
}