import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // PLATFORM_ADMIN can access everything
    if (user.role === 'PLATFORM_ADMIN') return true;
    
    // SCHOOL_ADMIN can only access their own school data
    if (user.role === 'SCHOOL_ADMIN') {
      const request = context.switchToHttp().getRequest();
      let schoolId = request.params.schoolId || request.body?.schoolId || request.query?.schoolId;
      
      // Handle case where schoolId is "undefined" string or not provided
      if (schoolId === 'undefined' || schoolId === undefined || schoolId === null || schoolId === '') {
        // If no schoolId in request, check if this is a non-school-scoped endpoint
        // For now, allow access - the actual data filtering happens in services
        console.log('[RolesGuard] No schoolId in request, allowing access for data filtering');
        return true;
      }
      
      console.log('[RolesGuard] SCHOOL_ADMIN - user.schoolId:', user.schoolId, 'request schoolId:', schoolId);
      
      // If a specific schoolId is being accessed, verify ownership
      if (user.schoolId !== schoolId) {
        console.log('[RolesGuard] Access denied - schoolId mismatch');
        throw new ForbiddenException('Access denied: School admin can only access their own school data');
      }
      
      // If user has no schoolId assigned, they can't access school data
      if (!user.schoolId) {
        console.log('[RolesGuard] Access denied - user has no schoolId');
        throw new ForbiddenException('Access denied: School admin must be assigned to a school');
      }
      
      // SCHOOL_ADMIN can access school-scoped endpoints
      if (requiredRoles.includes('SCHOOL_ADMIN')) {
        return true;
      }
    }
    
    return requiredRoles.some((role) => user.role === role);
  }
}