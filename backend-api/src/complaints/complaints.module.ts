import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
@Module({
  imports: [],
  providers: [ComplaintsService],
  controllers: [ComplaintsController]
})
export class ComplaintsModule {}
