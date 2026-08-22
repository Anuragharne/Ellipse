import { Module } from '@nestjs/common';
import { InternalController } from './internal.controller';
import { EventsGateway } from './events.gateway';

@Module({
  controllers: [InternalController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class InternalModule {}
