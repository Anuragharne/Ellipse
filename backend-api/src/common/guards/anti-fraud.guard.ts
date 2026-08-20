import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
const ExifParser = require('exif-parser');

@Injectable()
export class AntiFraudInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const file = req.file as Express.Multer.File;
    const userId = req.user?.id;

    if (file && file.mimetype === 'image/jpeg') {
      try {
        const parser = ExifParser.create(file.buffer);
        const result = parser.parse();
        
        if (result.tags && result.tags.DateTimeOriginal) {
          const captureTime = result.tags.DateTimeOriginal * 1000;
          const now = Date.now();
          const thirtyMins = 30 * 60 * 1000;
          
          if (now - captureTime > thirtyMins) {
            await this.logViolation(userId, req, 'EXIF_STALE_PHOTO', 'Photo is older than 30 minutes');
            throw new HttpException('Photo must be taken within the last 30 minutes', HttpStatus.UNPROCESSABLE_ENTITY);
          }
        }
      } catch (e) {
        if (e instanceof HttpException) throw e;
        // If EXIF parsing fails, we could potentially reject, but we'll allow for now 
        // depending on strictness. Let's log it.
        console.warn('Could not parse EXIF data', e.message);
      }
    }

    return next.handle();
  }

  private async logViolation(userId: string, req: any, action: string, reason: string) {
    if (!userId) return;
    await this.prisma.citizenActivityLog.create({
      data: {
        citizenId: userId,
        action: action,
        flagReason: reason,
        ipAddress: req.ip,
        flagged: true,
      },
    });
  }
}
