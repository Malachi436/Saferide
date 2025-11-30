import { RoutesService } from './routes.service';
export declare class RoutesController {
    private readonly routesService;
    constructor(routesService: RoutesService);
    create(createRouteDto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    }>;
    findBySchool(schoolId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    }[]>;
    update(id: string, updateRouteDto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
    }>;
}
