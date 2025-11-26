import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenancyService } from './tenancy.service';
export declare class TenancyMiddleware implements NestMiddleware {
    private tenancyService;
    constructor(tenancyService: TenancyService);
    use(req: Request, res: Response, next: NextFunction): void;
}
