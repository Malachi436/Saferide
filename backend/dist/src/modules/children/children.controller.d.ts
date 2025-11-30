import { ChildrenService } from './children.service';
export declare class ChildrenController {
    private readonly childrenService;
    constructor(childrenService: ChildrenService);
    create(createChildDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        schoolId: string;
        dateOfBirth: Date;
        pickupType: import(".prisma/client").$Enums.PickupType;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
        pickupDescription: string | null;
        parentId: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        schoolId: string;
        dateOfBirth: Date;
        pickupType: import(".prisma/client").$Enums.PickupType;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
        pickupDescription: string | null;
        parentId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        schoolId: string;
        dateOfBirth: Date;
        pickupType: import(".prisma/client").$Enums.PickupType;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
        pickupDescription: string | null;
        parentId: string;
    }>;
    findByParent(parentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        schoolId: string;
        dateOfBirth: Date;
        pickupType: import(".prisma/client").$Enums.PickupType;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
        pickupDescription: string | null;
        parentId: string;
    }[]>;
    update(id: string, updateChildDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        schoolId: string;
        dateOfBirth: Date;
        pickupType: import(".prisma/client").$Enums.PickupType;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
        pickupDescription: string | null;
        parentId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        schoolId: string;
        dateOfBirth: Date;
        pickupType: import(".prisma/client").$Enums.PickupType;
        pickupLatitude: number | null;
        pickupLongitude: number | null;
        pickupDescription: string | null;
        parentId: string;
    }>;
}
