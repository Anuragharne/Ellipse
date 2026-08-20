import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    StorageModule, 
    ComplaintsModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
