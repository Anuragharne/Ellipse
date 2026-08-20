import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai_processing',
    }),
  ],
  providers: [ComplaintsService],
  controllers: [ComplaintsController]
})
export class ComplaintsModule {}
