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
        parentId: string;
    }>;
}
