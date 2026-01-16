import { RoutesService } from './routes.service';
import { RouteAutoService } from './route-auto.service';
export declare class RoutesController {
    private readonly routesService;
    private readonly routeAutoService;
    constructor(routesService: RoutesService, routeAutoService: RouteAutoService);
    create(createRouteDto: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        busId: string | null;
        shift: string | null;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        busId: string | null;
        shift: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        busId: string | null;
        shift: string | null;
    }>;
    findBySchool(schoolId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        busId: string | null;
        shift: string | null;
    }[]>;
    update(id: string, updateRouteDto: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        busId: string | null;
        shift: string | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        schoolId: string;
        busId: string | null;
        shift: string | null;
    }>;
    autoGenerateRoutes(schoolId: string): Promise<any>;
}
