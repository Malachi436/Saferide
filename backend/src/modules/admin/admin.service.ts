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
      totalCompanies,
      totalSchools,
      totalUsers,
      totalDrivers,
      totalChildren,
      totalBuses,
      totalRoutes,
      totalTrips,
    ] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.school.count(),
      this.prisma.user.count(),
      this.prisma.driver.count(),
      this.prisma.child.count(),
      this.prisma.bus.count(),
      this.prisma.route.count(),
      this.prisma.trip.count(),
    ]);

    return {
      totalCompanies,
      totalSchools,
      totalUsers,
      totalDrivers,
      totalChildren,
      totalBuses,
      totalRoutes,
      totalTrips,
    };
  }

  async getCompanyStats(companyId: string, user?: any): Promise<any> {
    // If user is COMPANY_ADMIN, verify they belong to this company
    if (user && user.role === 'COMPANY_ADMIN' && user.companyId !== companyId) {
      throw new NotFoundException('Company not found');
    }

    const [
      totalSchools,
      totalUsers,
      totalDrivers,
      totalChildren,
      totalBuses,
      totalRoutes,
      totalTrips,
    ] = await Promise.all([
      this.prisma.school.count({ where: { companyId } }),
      this.prisma.user.count({ where: { companyId } }),
      this.prisma.driver.count({ where: { user: { companyId } } }),
      this.prisma.child.count({ where: { school: { companyId } } }),
      this.prisma.bus.count({ where: { driver: { user: { companyId } } } }),
      this.prisma.route.count({ where: { school: { companyId } } }),
      this.prisma.trip.count({ where: { bus: { driver: { user: { companyId } } } } }),
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

  async createCompany(data: any): Promise<any> {
    const { name, email, phone, address, adminName, adminEmail, adminPassword, schoolName, schoolCode } = data;
    
    const company = await this.prisma.company.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    if (adminEmail && adminPassword) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await this.prisma.user.create({
        data: {
          firstName: adminName?.split(' ')[0] || 'Admin',
          lastName: adminName?.split(' ')[1] || 'User',
          email: adminEmail,
          passwordHash,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
        },
      });
    }

    // If schoolName provided, create first school
    if (schoolName) {
      await this.prisma.school.create({
        data: {
          name: schoolName,
          schoolCode: schoolCode || null,
          companyId: company.id,
        },
      });
    }

    return company;
  }

  async createSchool(companyId: string, data: any): Promise<any> {
    return this.prisma.school.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async getAllCompanies(): Promise<any> {
    return this.prisma.company.findMany({
      include: {
        users: true,
        schools: true,
      },
    });
  }

  async getAllSchools(): Promise<any> {
    return this.prisma.school.findMany({
      include: {
        company: { select: { id: true, name: true } },
      },
    });
  }

  async getCompanySchools(companyId: string): Promise<any> {
    return this.prisma.school.findMany({
      where: { companyId },
      include: {
        company: { select: { id: true, name: true } },
      },
    });
  }

  async getCompanyRoutes(companyId: string): Promise<any> {
    return this.prisma.route.findMany({
      where: {
        school: { companyId },
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

  async getCompanyChildren(companyId: string): Promise<any> {
    return this.prisma.child.findMany({
      where: {
        school: { companyId },
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
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getChildrenPaymentStatus(companyId: string): Promise<any> {
    const children = await this.prisma.child.findMany({
      where: {
        school: { companyId },
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

  async getCompanyDrivers(companyId: string): Promise<any> {
    return this.prisma.driver.findMany({
      where: {
        user: { companyId },
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
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: true,
        schools: true,
      },
    });

    if (!company) return null;

    const buses = await this.prisma.bus.findMany({
      where: { driver: { user: { companyId } } },
    });

    const drivers = await this.prisma.driver.findMany({
      where: { user: { companyId } },
      include: { user: true },
    });

    return {
      ...company,
      buses,
      drivers,
    };
  }

  async deleteCompany(companyId: string): Promise<any> {
    await this.prisma.childAttendance.deleteMany({
      where: { trip: { bus: { driver: { user: { companyId } } } } },
    });

    await this.prisma.trip.deleteMany({
      where: { bus: { driver: { user: { companyId } } } },
    });

    await this.prisma.scheduledRoute.deleteMany({
      where: { driver: { user: { companyId } } },
    });

    await this.prisma.bus.deleteMany({
      where: { driver: { user: { companyId } } },
    });

    await this.prisma.driver.deleteMany({
      where: { user: { companyId } },
    });

    await this.prisma.route.deleteMany({
      where: { school: { companyId } },
    });

    await this.prisma.school.deleteMany({
      where: { companyId },
    });

    await this.prisma.user.deleteMany({
      where: { companyId },
    });

    return this.prisma.company.delete({
      where: { id: companyId },
    });
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

  async getCompanyAnalytics(companyId: string, range?: string): Promise<any> {
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

    const [totalTrips, completedTrips, inProgressTrips, totalChildren, activeChildren, totalPayments, successfulPayments, missedPickups, onTimeTrips] = await Promise.all([
      this.prisma.trip.count({
        where: { 
          bus: { driver: { user: { companyId } } },
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.trip.count({
        where: {
          bus: { driver: { user: { companyId } } },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.trip.count({
        where: {
          bus: { driver: { user: { companyId } } },
          status: 'IN_PROGRESS',
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.child.count({
        where: { school: { companyId } },
      }),
      this.prisma.child.count({
        where: {
          school: { companyId },
          attendance: {
            some: {
              trip: {
                status: 'IN_PROGRESS',
              },
            },
          },
        },
      }),
      this.prisma.paymentIntent.count({
        where: {
          parent: { companyId },
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.paymentIntent.count({
        where: {
          parent: { companyId },
          status: 'succeeded',
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.childAttendance.count({
        where: {
          trip: { bus: { driver: { user: { companyId } } } },
          status: 'MISSED',
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.trip.count({
        where: {
          bus: { driver: { user: { companyId } } },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
    ]);

    const tripCompletionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
    const paymentSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
    const attendanceRate = totalChildren > 0 ? ((totalChildren - missedPickups) / totalChildren) * 100 : 100;

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
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        successRate: paymentSuccessRate,
      },
      attendance: {
        missedPickups,
        rate: attendanceRate,
      },
      performance: {
        onTimeTrips,
        tripCompletionRate,
      },
    };
  }

  async getCompanyTrips(companyId: string): Promise<any> {
    return this.prisma.trip.findMany({
      where: {
        bus: { driver: { user: { companyId } } },
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

  async getCompanyActiveTrips(companyId: string): Promise<any> {
    return this.prisma.trip.findMany({
      where: {
        bus: { driver: { user: { companyId } } },
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

  async getAttendanceReport(companyId: string, range?: string): Promise<any> {
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
        trip: { bus: { driver: { user: { companyId } } } },
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

  async getPaymentReport(companyId: string, range?: string): Promise<any> {
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

    const payments = await this.prisma.paymentIntent.findMany({
      where: {
        parent: { companyId },
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

  async getDriverPerformanceReport(companyId: string, range?: string): Promise<any> {
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
        user: { companyId },
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
  async updateCompanyFare(companyId: string, newFare: number, adminId: string, reason?: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const oldFare = company.baseFare;

    // Update company fare
    const updatedCompany = await this.prisma.company.update({
      where: { id: companyId },
      data: { baseFare: newFare },
    });

    // Record fare history
    await this.prisma.fareHistory.create({
      data: {
        companyId,
        oldFare,
        newFare,
        changedBy: adminId,
        reason,
      },
    });

    // Notify all parents in this company
    const parents = await this.prisma.user.findMany({
      where: {
        role: 'PARENT',
        parentChildren: {
          some: {
            school: {
              companyId,
            },
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
      company: updatedCompany,
      oldFare,
      newFare,
      change: newFare - oldFare,
      parentsNotified: parents.length,
    };
  }

  async getCompanyFare(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        baseFare: true,
        currency: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async getFareHistory(companyId: string) {
    return this.prisma.fareHistory.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Last 50 changes
    });
  }
}
