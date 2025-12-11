import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

  async getCompanyStats(companyId: string): Promise<any> {
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
    const { name, email, phone, address, adminName, adminEmail, adminPassword } = data;
    
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

  async getCompanyChildren(companyId: string): Promise<any> {
    return this.prisma.child.findMany({
      where: {
        school: { companyId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        parentId: true,
        schoolId: true,
        pickupType: true,
        pickupDescription: true,
        homeLatitude: true,
        homeLongitude: true,
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

  async getCompanyAnalytics(companyId: string): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalTrips, completedTrips, inProgressTrips, totalChildren, activeChildren, totalPayments, successfulPayments, missedPickups, onTimeTrips] = await Promise.all([
      this.prisma.trip.count({
        where: { bus: { driver: { user: { companyId } } } },
      }),
      this.prisma.trip.count({
        where: {
          bus: { driver: { user: { companyId } } },
          status: 'COMPLETED',
        },
      }),
      this.prisma.trip.count({
        where: {
          bus: { driver: { user: { companyId } } },
          status: 'IN_PROGRESS',
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
        },
      }),
      this.prisma.paymentIntent.count({
        where: {
          parent: { companyId },
          status: 'succeeded',
        },
      }),
      this.prisma.childAttendance.count({
        where: {
          trip: { bus: { driver: { user: { companyId } } } },
          status: 'MISSED',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.trip.count({
        where: {
          bus: { driver: { user: { companyId } } },
          status: 'COMPLETED',
          createdAt: { gte: thirtyDaysAgo },
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
}
