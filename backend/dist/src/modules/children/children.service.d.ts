import { PrismaService } from '../../prisma/prisma.service';
import { Child } from '@prisma/client';
import { LinkChildDto, BulkUpdateGradesDto } from './dto/link-child.dto';
import { RequestLocationChangeDto, ReviewLocationChangeDto } from './dto/location-change.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ChildrenService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    findOne(id: string): Promise<Child | null>;
    findByParentId(parentId: string): Promise<Child[]>;
    findBySchoolId(schoolId: string): Promise<Child[]>;
    create(data: any): Promise<Child>;
    update(id: string, data: any): Promise<Child>;
    findAll(): Promise<Child[]>;
    remove(id: string): Promise<Child>;
    generateUniqueCode(): Promise<string>;
    linkChildToParent(parentId: string, linkDto: LinkChildDto): Promise<{
        school: {
            id: string;
            name: string;
            address: string | null;
            createdAt: Date;
            updatedAt: Date;
            latitude: number | null;
            longitude: number | null;
            companyId: string;
        };
        parent: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        schoolId: string;
        uniqueCode: string;
        dateOfBirth: Date;
        grade: string | null;
        pickupType: import(".prisma/client").$Enums.PickupType;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
        pickupDescription: string | null;
        homeLatitude: number | null;
        homeLongitude: number | null;
        homeAddress: string | null;
        colorCode: string;
        isLinked: boolean;
        parentId: string | null;
    }>;
    bulkUpdateGrades(companyId: string, updateDto: BulkUpdateGradesDto, adminId: string): Promise<{
        message: string;
        promoted: number;
        repeated: number;
        updated?: undefined;
    } | {
        message: string;
        updated: number;
        promoted?: undefined;
        repeated?: undefined;
    }>;
    requestLocationChange(parentId: string, requestDto: RequestLocationChangeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LocationChangeStatus;
        childId: string;
        requestedBy: string;
        reason: string | null;
        oldLatitude: number | null;
        oldLongitude: number | null;
        oldAddress: string | null;
        newLatitude: number;
        newLongitude: number;
        newAddress: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        reviewNotes: string | null;
        completedAt: Date | null;
    }>;
    reviewLocationChangeRequest(requestId: string, adminId: string, reviewDto: ReviewLocationChangeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LocationChangeStatus;
        childId: string;
        requestedBy: string;
        reason: string | null;
        oldLatitude: number | null;
        oldLongitude: number | null;
        oldAddress: string | null;
        newLatitude: number;
        newLongitude: number;
        newAddress: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        reviewNotes: string | null;
        completedAt: Date | null;
    }>;
    getPendingLocationChangeRequests(companyId: string): Promise<({
        child: {
            school: {
                id: string;
                name: string;
                address: string | null;
                createdAt: Date;
                updatedAt: Date;
                latitude: number | null;
                longitude: number | null;
                companyId: string;
            };
            parent: {
                id: string;
                email: string;
                phone: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            schoolId: string;
            uniqueCode: string;
            dateOfBirth: Date;
            grade: string | null;
            pickupType: import(".prisma/client").$Enums.PickupType;
            pickupLatitude: number | null;
            pickupLongitude: number | null;
            pickupDescription: string | null;
            homeLatitude: number | null;
            homeLongitude: number | null;
            homeAddress: string | null;
            colorCode: string;
            isLinked: boolean;
            parentId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.LocationChangeStatus;
        childId: string;
        requestedBy: string;
        reason: string | null;
        oldLatitude: number | null;
        oldLongitude: number | null;
        oldAddress: string | null;
        newLatitude: number;
        newLongitude: number;
        newAddress: string | null;
        reviewedBy: string | null;
        reviewedAt: Date | null;
        reviewNotes: string | null;
        completedAt: Date | null;
    })[]>;
}
