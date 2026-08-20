import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsService } from './complaints.service';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('ComplaintsService', () => {
  let service: ComplaintsService;

  beforeEach(async () => {
    const mockPrismaService = {};
    const mockStorageService = {};
    const mockQueue = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: getQueueToken('ai_processing'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
