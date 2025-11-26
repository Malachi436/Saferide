import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
export type JwtPayload = {
    email: string;
    sub: string;
    role: string;
    companyId: string;
    schoolId: string;
};
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        email: string;
        role: string;
        companyId: string;
        schoolId: string;
    }>;
}
export {};
