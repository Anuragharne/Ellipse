import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsController } from './complaints.controller';

import { PrismaService } from '../prisma/prisma.service';
import { ComplaintsService } from './complaints.service';

describe('ComplaintsController', () => {
  let controller: ComplaintsController;

  beforeEach(async () => {
    const mockPrismaService = {};
    const mockComplaintsService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintsController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ComplaintsService, useValue: mockComplaintsService },
      ],
    }).compile();

    controller = module.get<ComplaintsController>(ComplaintsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
