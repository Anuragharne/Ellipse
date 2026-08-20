import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const secret = request.headers['x-ai-service-secret'];
    
    if (!secret || secret !== process.env.AI_SERVICE_SECRET) {
      throw new UnauthorizedException('Invalid AI Service Secret');
    }
    
    return true;
  }
}
