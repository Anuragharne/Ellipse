import { Module } from '@nestjs/common';
import { CrewController } from './crew.controller';
import { CrewService } from './crew.service';

import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { InternalModule } from '../internal/internal.module';

@Module({
  imports: [PrismaModule, StorageModule, InternalModule],
  controllers: [CrewController],
  providers: [CrewService]
})
export class CrewModule {}
