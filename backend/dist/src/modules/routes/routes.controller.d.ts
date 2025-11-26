import { RoutesService } from './routes.service';
export declare class RoutesController {
    private readonly routesService;
    constructor(routesService: RoutesService);
    create(createRouteDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        name: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        name: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        name: string;
    }>;
    findBySchool(schoolId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        name: string;
    }[]>;
    update(id: string, updateRouteDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        name: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        name: string;
    }>;
}
