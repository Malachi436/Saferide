import { RoutesService } from './routes.service';
import { RouteAutoService } from './route-auto.service';
export declare class RoutesController {
    private readonly routesService;
    private readonly routeAutoService;
    constructor(routesService: RoutesService, routeAutoService: RouteAutoService);
    create(createRouteDto: any): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shift: string | null;
        busId: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shift: string | null;
        busId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shift: string | null;
        busId: string | null;
    }>;
    findBySchool(schoolId: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shift: string | null;
        busId: string | null;
    }[]>;
    update(id: string, updateRouteDto: any): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shift: string | null;
        busId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        schoolId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        shift: string | null;
        busId: string | null;
    }>;
    autoGenerateRoutes(schoolId: string): Promise<any>;
}
