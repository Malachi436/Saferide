import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Child } from '@prisma/client';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

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
}