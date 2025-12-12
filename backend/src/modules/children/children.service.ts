import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Child } from '@prisma/client';
import { LinkChildDto, BulkUpdateGradesDto } from './dto/link-child.dto';
import { RequestLocationChangeDto, ReviewLocationChangeDto } from './dto/location-change.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChildrenService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findOne(id: string): Promise<Child | null> {
    return this.prisma.child.findUnique({
      where: { id },
    });
  }

  async findByParentId(parentId: string): Promise<Child[]> {
    return this.prisma.child.findMany({
      where: { parentId },
    });
  }

  async findBySchoolId(schoolId: string): Promise<Child[]> {
    return this.prisma.child.findMany({
      where: { schoolId },
    });
  }

  async create(data: any): Promise<Child> {
    return this.prisma.child.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Child> {
    return this.prisma.child.update({
      where: { id },
      data,
    });
  }

  async findAll(): Promise<Child[]> {
    return this.prisma.child.findMany();
  }

  async remove(id: string): Promise<Child> {
    return this.prisma.child.delete({
      where: { id },
    });
  }

  // Generate unique code for child (e.g., ROSxxxx)
  async generateUniqueCode(): Promise<string> {
    const prefix = 'ROS';
    let code: string;
    let exists = true;

    while (exists) {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
      code = `${prefix}${randomNum}`;
      
      const existing = await this.prisma.child.findUnique({
        where: { uniqueCode: code },
      });
      
      exists = !!existing;
    }

    return code;
  }

  // Link child to parent using unique code
  async linkChildToParent(parentId: string, linkDto: LinkChildDto) {
    const child = await this.prisma.child.findUnique({
      where: { uniqueCode: linkDto.uniqueCode },
    });

    if (!child) {
      throw new NotFoundException('Invalid child code');
    }

    if (child.isLinked && child.parentId) {
      throw new BadRequestException('This child is already linked to a parent');
    }

    // Update child with parent and home location
    const updatedChild = await this.prisma.child.update({
      where: { id: child.id },
      data: {
        parentId,
        isLinked: true,
        homeLatitude: linkDto.homeLatitude,
        homeLongitude: linkDto.homeLongitude,
        homeAddress: linkDto.homeAddress,
      },
      include: {
        school: true,
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedChild;
  }

  // Bulk update grades (for annual promotions)
  async bulkUpdateGrades(companyId: string, updateDto: BulkUpdateGradesDto, adminId: string) {
    if (updateDto.action === 'PROMOTE') {
      // Get all children in the company
      const children = await this.prisma.child.findMany({
        where: {
          school: {
            companyId,
          },
        },
      });

      const gradeMap: Record<string, string> = {
        'Pre-K': 'Kindergarten',
        'Kindergarten': 'Grade 1',
        'Grade 1': 'Grade 2',
        'Grade 2': 'Grade 3',
        'Grade 3': 'Grade 4',
        'Grade 4': 'Grade 5',
        'Grade 5': 'Grade 6',
        'Grade 6': 'Grade 7',
        'Grade 7': 'Grade 8',
        'Grade 8': 'Grade 9',
        'Grade 9': 'Grade 10',
        'Grade 10': 'Grade 11',
        'Grade 11': 'Grade 12',
        'Grade 12': 'Graduated',
      };

      const updates = [];
      const repeatedIds = new Set(updateDto.repeatedStudentIds || []);

      for (const child of children) {
        // Skip students who repeated
        if (repeatedIds.has(child.id)) {
          continue;
        }

        const currentGrade = child.grade || 'Pre-K';
        const newGrade = gradeMap[currentGrade] || currentGrade;

        updates.push(
          this.prisma.child.update({
            where: { id: child.id },
            data: { grade: newGrade },
          }),
        );
      }

      await this.prisma.$transaction(updates);

      return {
        message: 'Grades updated successfully',
        promoted: updates.length,
        repeated: repeatedIds.size,
      };
    } else if (updateDto.action === 'CUSTOM' && updateDto.children) {
      // Custom grade updates
      const updates = updateDto.children.map((child) =>
        this.prisma.child.update({
          where: { id: child.childId },
          data: { grade: child.newGrade },
        }),
      );

      await this.prisma.$transaction(updates);

      return {
        message: 'Custom grade updates completed',
        updated: updates.length,
      };
    }

    throw new BadRequestException('Invalid action');
  }

  // Request location change
  async requestLocationChange(parentId: string, requestDto: RequestLocationChangeDto) {
    const child = await this.prisma.child.findUnique({
      where: { id: requestDto.childId },
      include: { parent: true, school: true },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    if (child.parentId !== parentId) {
      throw new BadRequestException('You can only request location changes for your own children');
    }

    // Create location change request
    const request = await this.prisma.locationChangeRequest.create({
      data: {
        childId: requestDto.childId,
        requestedBy: parentId,
        oldLatitude: child.homeLatitude,
        oldLongitude: child.homeLongitude,
        oldAddress: child.homeAddress,
        newLatitude: requestDto.newLatitude,
        newLongitude: requestDto.newLongitude,
        newAddress: requestDto.newAddress,
        reason: requestDto.reason,
        status: 'PENDING',
      },
    });

    // Notify company admins
    const admins = await this.prisma.user.findMany({
      where: {
        companyId: child.school.companyId,
        role: 'COMPANY_ADMIN',
      },
    });

    for (const admin of admins) {
      await this.notificationsService.create({
        userId: admin.id,
        title: 'Location Change Request',
        message: `${child.parent.firstName} ${child.parent.lastName} has requested a location change for ${child.firstName} ${child.lastName}`,
        type: 'LOCATION_CHANGE_REQUEST',
        relatedEntityType: 'LOCATION_CHANGE_REQUEST',
        relatedEntityId: request.id,
        metadata: {
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          requestId: request.id,
        },
      });
    }

    return request;
  }

  // Review location change request (admin)
  async reviewLocationChangeRequest(
    requestId: string,
    adminId: string,
    reviewDto: ReviewLocationChangeDto,
  ) {
    const request = await this.prisma.locationChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        child: {
          include: {
            parent: true,
            school: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Location change request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been reviewed');
    }

    // Update request
    const updatedRequest = await this.prisma.locationChangeRequest.update({
      where: { id: requestId },
      data: {
        status: reviewDto.status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: reviewDto.reviewNotes,
        completedAt: reviewDto.status === 'APPROVED' ? new Date() : undefined,
      },
    });

    // If approved, update child's location
    if (reviewDto.status === 'APPROVED') {
      await this.prisma.child.update({
        where: { id: request.childId },
        data: {
          homeLatitude: request.newLatitude,
          homeLongitude: request.newLongitude,
          homeAddress: request.newAddress,
        },
      });

      // Notify parent
      await this.notificationsService.create({
        userId: request.requestedBy,
        title: 'Location Change Approved',
        message: `Your location change request for ${request.child.firstName} has been approved. The new location is now active.`,
        type: 'INFO',
      });
    } else {
      // Notify parent of rejection
      await this.notificationsService.create({
        userId: request.requestedBy,
        title: 'Location Change Rejected',
        message: `Your location change request for ${request.child.firstName} was not approved. ${reviewDto.reviewNotes || ''}`,
        type: 'WARNING',
      });
    }

    return updatedRequest;
  }

  // Get pending location change requests for a company
  async getPendingLocationChangeRequests(companyId: string) {
    return this.prisma.locationChangeRequest.findMany({
      where: {
        status: 'PENDING',
        child: {
          school: {
            companyId,
          },
        },
      },
      include: {
        child: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            school: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}