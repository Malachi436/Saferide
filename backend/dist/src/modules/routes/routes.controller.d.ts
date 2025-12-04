import { RoutesService } from './routes.service';
import { RouteAutoService } from './route-auto.service';
export declare class RoutesController {
    private readonly routesService;
    private readonly routeAutoService;
    constructor(routesService: RoutesService, routeAutoService: RouteAutoService);
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
    autoGenerateRoutes(schoolId: string): Promise<any>;
}
