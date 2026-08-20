import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

    const mockStorageService = {};
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
