import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getPlatformStats(): Promise<any> {
    const [
      totalSchools,
      totalUsers,
      totalDrivers,
      totalChildren,
      totalBuses,
      totalRoutes,
      totalTrips,
    ] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.user.count(),
      this.prisma.driver.count(),
      this.prisma.child.count(),
      this.prisma.bus.count(),
      this.prisma.route.count(),
      this.prisma.trip.count(),
    ]);

    return {
      totalSchools,
      totalUsers,
      totalDrivers,
      totalChildren,
      totalBuses,
      totalRoutes,
      totalTrips,
    };
  }

  async getSchoolStats(schoolId: string, user?: any): Promise<any> {
    // Verify school exists
    const school = await this.prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      throw new NotFoundException('School not found');
    }

    const [
      totalUsers,
      totalDrivers,
      totalChildren,
      totalBuses,
      totalRoutes,
      totalTrips,
    ] = await Promise.all([
      this.prisma.user.count({ where: { schoolId } }),
      this.prisma.driver.count({ where: { user: { schoolId } } }),
      this.prisma.child.count({ where: { schoolId } }),
      this.prisma.bus.count({ where: { schoolId } }),
      this.prisma.route.count({ where: { schoolId } }),
      this.prisma.trip.count({ where: { route: { schoolId } } }),
    ]);

    return {
      totalUsers,
      totalDrivers,
      totalChildren,
      totalBuses,
      totalRoutes,
      totalTrips,
    };
  }

  async createCompany(data: any): Promise<any> {
    // Companies are no longer supported
    throw new BadRequestException('Companies are no longer supported. Schools are now independent.');
  }

  async createSchool(data: any): Promise<any> {
    // Extract admin credentials if provided
    const { adminEmail, adminPassword, adminFirstName, adminLastName, ...schoolData } = data;

    // Create the school first
    const school = await this.prisma.school.create({
      data: schoolData,
    });

    // If admin credentials are provided, create a school admin user
    if (adminEmail && adminPassword && adminFirstName && adminLastName) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: adminFirstName,
          lastName: adminLastName,
          role: 'SCHOOL_ADMIN',
          schoolId: school.id,
        },
      });
    }

    return school;
  }

  async getAllSchools(): Promise<any> {
    return this.prisma.school.findMany();
  }

  async getCompanySchools(schoolId: string): Promise<any> {
    return this.prisma.school.findMany({
      where: { id: schoolId },
    });
  }

  async getSchoolRoutes(schoolId: string): Promise<any> {
    return this.prisma.route.findMany({
      where: {
        schoolId,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        bus: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        stops: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
    });
  }

  async getSchoolChildren(schoolId: string): Promise<any> {
    return this.prisma.child.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        uniqueCode: true,
        firstName: true,
        lastName: true,
        grade: true,
        dateOfBirth: true,
        parentId: true,
        parentPhone: true,
        schoolId: true,
        pickupType: true,
        pickupDescription: true,
        pickupLatitude: true,
        pickupLongitude: true,
        homeLatitude: true,
        homeLongitude: true,
        isClaimed: true,
        daysUntilPayment: true,
        allergies: true,
        parent: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        route: {
          select: {
            id: true,
            name: true,
            bus: {
              select: {
                id: true,
                plateNumber: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getChildrenPaymentStatus(schoolId: string): Promise<any> {
    const children = await this.prisma.child.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return children.map((child) => ({
      childId: child.id,
      totalAmount: 500.0,
      paidAmount: Math.random() > 0.5 ? 500.0 : 250.0,
      pendingAmount: Math.random() > 0.5 ? 0 : 250.0,
      status: Math.random() > 0.7 ? 'OVERDUE' : Math.random() > 0.5 ? 'PENDING' : 'PAID',
    }));
  }

  async getSchoolDrivers(schoolId: string): Promise<any> {
    return this.prisma.driver.findMany({
      where: {
        user: { schoolId },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        buses: {
          select: {
            id: true,
            plateNumber: true,
            capacity: true,
          },
        },
      },
    });
  }

  async saveDriverPhoto(driverId: string, file: any): Promise<any> {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'drivers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${driverId}-${Date.now()}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    return {
      message: 'Photo uploaded successfully',
      photoUrl: `/uploads/drivers/${filename}`,
    };
  }

  async getCompanyById(companyId: string): Promise<any> {
    // Companies are no longer supported
    throw new BadRequestException('Companies are no longer supported');
  }

  async deleteCompany(companyId: string): Promise<any> {
    // Companies are no longer supported
    throw new BadRequestException('Companies are no longer supported');
  }

  async updateSchool(schoolId: string, data: any): Promise<any> {
    return this.prisma.school.update({
      where: { id: schoolId },
      data,
    });
  }

  async deleteSchool(schoolId: string): Promise<any> {
    // Delete associated routes first
    await this.prisma.route.deleteMany({
      where: { schoolId },
    });

    // Delete associated children
    await this.prisma.child.deleteMany({
      where: { schoolId },
    });

    return this.prisma.school.delete({
      where: { id: schoolId },
    });
  }

  async getSchoolAnalytics(schoolId: string, range?: string): Promise<any> {
    // Calculate date filter based on range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days (4 weeks)
        break;
    }

    const [totalTrips, completedTrips, inProgressTrips, totalChildren, activeChildren] = await Promise.all([
      this.prisma.trip.count({
        where: { 
          route: { schoolId },
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.trip.count({
        where: {
          route: { schoolId },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.trip.count({
        where: {
          route: { schoolId },
          status: 'IN_PROGRESS',
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.child.count({
        where: { schoolId },
      }),
      this.prisma.child.count({
        where: {
          schoolId,
        },
      }),
      this.prisma.trip.count({
        where: {
          route: { schoolId },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
    ]);

    const tripCompletionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
    const attendanceRate = totalChildren > 0 ? (activeChildren / totalChildren) * 100 : 100;

    return {
      trips: {
        total: totalTrips,
        completed: completedTrips,
        inProgress: inProgressTrips,
        completionRate: tripCompletionRate,
      },
      children: {
        total: totalChildren,
        active: activeChildren,
      },
      attendance: {
        rate: attendanceRate,
      },
    };
  }

  async getSchoolTrips(schoolId: string): Promise<any> {
    return this.prisma.trip.findMany({
      where: {
        route: { schoolId },
      },
      include: {
        bus: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        route: {
          select: {
            id: true,
            name: true,
          },
        },
        attendances: {
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  async getSchoolActiveTrips(schoolId: string): Promise<any> {
    return this.prisma.trip.findMany({
      where: {
        route: { schoolId },
        status: 'IN_PROGRESS',
      },
      include: {
        bus: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        route: {
          select: {
            id: true,
            name: true,
          },
        },
        attendances: {
          include: {
            child: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async getAttendanceReport(schoolId: string, range?: string): Promise<any> {
    // Calculate date filter based on range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days (4 weeks)
        break;
    }

    const attendances = await this.prisma.childAttendance.findMany({
      where: {
        trip: { route: { schoolId } },
        timestamp: {
          gte: startDate,
        },
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            parent: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            school: {
              select: {
                name: true,
              },
            },
          },
        },
        trip: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            bus: {
              select: {
                plateNumber: true,
              },
            },
            route: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 1000,
    });

    return attendances.map((att) => ({
      date: att.timestamp,
      childName: `${att.child.firstName} ${att.child.lastName}`,
      parentName: `${att.child.parent.firstName} ${att.child.parent.lastName}`,
      parentEmail: att.child.parent.email,
      parentPhone: att.child.parent.phone,
      schoolName: att.child.school.name,
      tripRoute: att.trip.route.name,
      busPlate: att.trip.bus.plateNumber,
      status: att.status,
      tripStatus: att.trip.status,
      recordedBy: att.recordedBy,
    }));
  }

  async getPaymentReport(schoolId: string, range?: string): Promise<any> {
    // Calculate date filter based on range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get all parents of children in this school
    const children = await this.prisma.child.findMany({
      where: { schoolId },
      select: { parentId: true },
    });
    const parentIds = [...new Set(children.map(c => c.parentId))];

    const payments = await this.prisma.paymentIntent.findMany({
      where: {
        parentId: { in: parentIds },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        parent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1000,
    });

    return payments.map((payment) => ({
      date: payment.createdAt,
      parentName: `${payment.parent.firstName} ${payment.parent.lastName}`,
      parentEmail: payment.parent.email,
      parentPhone: payment.parent.phone,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      hubtleRef: payment.hubtleRef || 'N/A',
      paymentId: payment.id,
    }));
  }

  async getDriverPerformanceReport(schoolId: string, range?: string): Promise<any> {
    // Calculate date filter based on range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const drivers = await this.prisma.driver.findMany({
      where: {
        user: { schoolId },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        trips: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          select: {
            id: true,
            status: true,
            startTime: true,
            endTime: true,
            createdAt: true,
          },
        },
        buses: {
          select: {
            plateNumber: true,
          },
        },
      },
    });

    return drivers.map((driver) => {
      const totalTrips = driver.trips.length;
      const completedTrips = driver.trips.filter((t) => t.status === 'COMPLETED').length;
      const inProgressTrips = driver.trips.filter((t) => t.status === 'IN_PROGRESS').length;
      const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

      // Calculate on-time trips (completed within reasonable time)
      const onTimeTrips = driver.trips.filter((trip) => {
        if (trip.status === 'COMPLETED' && trip.startTime && trip.endTime) {
          const duration = new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime();
          const hours = duration / (1000 * 60 * 60);
          return hours <= 2; // Assume trips should complete within 2 hours
        }
        return false;
      }).length;

      const onTimeRate = completedTrips > 0 ? (onTimeTrips / completedTrips) * 100 : 0;

      return {
        driverName: `${driver.user.firstName} ${driver.user.lastName}`,
        email: driver.user.email,
        phone: driver.user.phone,
        license: driver.license,
        buses: driver.buses.map((b) => b.plateNumber).join(', '),
        totalTrips,
        completedTrips,
        inProgressTrips,
        completionRate: completionRate.toFixed(2),
        onTimeTrips,
        onTimeRate: onTimeRate.toFixed(2),
      };
    });
  }

  // Fare Management
  async updateCompanyFare(schoolId: string, newFare: number, adminId: string, reason?: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const oldFare = school.baseFare;

    // Update school fare
    const updatedSchool = await this.prisma.school.update({
      where: { id: schoolId },
      data: { baseFare: newFare },
    });

    // Record fare history
    await this.prisma.fareHistory.create({
      data: {
        schoolId,
        oldFare,
        newFare,
        changedBy: adminId,
        reason,
      },
    });

    // Notify all parents in this school
    const parents = await this.prisma.user.findMany({
      where: {
        role: 'PARENT',
        parentChildren: {
          some: {
            schoolId,
          },
        },
      },
    });

    for (const parent of parents) {
      await this.notificationsService.create({
        userId: parent.id,
        title: 'Fare Update',
        message: `The bus fare has been updated from UGX ${oldFare.toLocaleString()} to UGX ${newFare.toLocaleString()}. ${reason || ''}`,
        type: 'PAYMENT',
        metadata: {
          oldFare,
          newFare,
          change: newFare - oldFare,
          percentageChange: ((newFare - oldFare) / oldFare * 100).toFixed(2),
        },
      });
    }

    return {
      school: updatedSchool,
      oldFare,
      newFare,
      change: newFare - oldFare,
      parentsNotified: parents.length,
    };
  }

  async getSchoolFare(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        baseFare: true,
        currency: true,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return school;
  }

  async getFareHistory(schoolId: string) {
    return this.prisma.fareHistory.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Last 50 changes
    });
  }
}
