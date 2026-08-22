import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { BullModule } from '@nestjs/bullmq';
import { InternalModule } from './internal/internal.module';
import { CrewModule } from './crew/crew.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    StorageModule, 
    ComplaintsModule,
    InternalModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    }),
    CrewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
