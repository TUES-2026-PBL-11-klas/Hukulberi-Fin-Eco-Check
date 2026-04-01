import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Config } from './schemas/config.entity';
import { FeatureFlag } from './schemas/feature-flag.entity';

describe('AdminService', () => {
  let service: AdminService;

  const mockConfig = {
    id: '1',
    key: 'app.name',
    value: 'EcoCheck',
    description: 'Application name',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFlag = {
    id: '2',
    key: 'eco-scoring',
    enabled: true,
    description: 'Enable eco scoring',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConfigRepo = {
    find: jest.fn().mockResolvedValue([mockConfig]),
    findOneBy: jest.fn().mockResolvedValue(mockConfig),
    create: jest.fn().mockReturnValue(mockConfig),
    save: jest.fn().mockResolvedValue(mockConfig),
    remove: jest.fn().mockResolvedValue(undefined),
    count: jest.fn().mockResolvedValue(4),
  };

  const mockFlagRepo = {
    find: jest.fn().mockResolvedValue([mockFlag]),
    findOneBy: jest.fn().mockResolvedValue(mockFlag),
    create: jest.fn().mockReturnValue(mockFlag),
    save: jest.fn().mockResolvedValue(mockFlag),
    count: jest.fn().mockResolvedValue(4),
    countBy: jest.fn().mockResolvedValue(2),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Config), useValue: mockConfigRepo },
        { provide: getRepositoryToken(FeatureFlag), useValue: mockFlagRepo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllConfigs', () => {
    it('should return all configs ordered by key', async () => {
      const result = await service.getAllConfigs();
      expect(result).toEqual([mockConfig]);
      expect(mockConfigRepo.find).toHaveBeenCalledWith({
        order: { key: 'ASC' },
      });
    });
  });

  describe('getConfigByKey', () => {
    it('should return a config by key', async () => {
      const result = await service.getConfigByKey('app.name');
      expect(result).toEqual(mockConfig);
    });

    it('should throw NotFoundException if config not found', async () => {
      mockConfigRepo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.getConfigByKey('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createConfig', () => {
    it('should create and save a config entry', async () => {
      const dto = { key: 'app.name', value: 'EcoCheck' };
      const result = await service.createConfig(dto);
      expect(result).toEqual(mockConfig);
      expect(mockConfigRepo.create).toHaveBeenCalledWith(dto);
      expect(mockConfigRepo.save).toHaveBeenCalled();
    });
  });

  describe('updateConfig', () => {
    it('should update an existing config entry', async () => {
      const dto = { value: 'NewValue' };
      const result = await service.updateConfig('app.name', dto);
      expect(result).toEqual(mockConfig);
    });
  });

  describe('deleteConfig', () => {
    it('should remove a config entry', async () => {
      await service.deleteConfig('app.name');
      expect(mockConfigRepo.remove).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all feature flags', async () => {
      const result = await service.getAllFeatureFlags();
      expect(result).toEqual([mockFlag]);
    });
  });

  describe('getFeatureFlag', () => {
    it('should return a feature flag by key', async () => {
      const result = await service.getFeatureFlag('eco-scoring');
      expect(result).toEqual(mockFlag);
    });

    it('should throw NotFoundException if flag not found', async () => {
      mockFlagRepo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.getFeatureFlag('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateFeatureFlag', () => {
    it('should toggle a feature flag', async () => {
      const dto = { enabled: false };
      const result = await service.updateFeatureFlag('eco-scoring', dto);
      expect(result).toEqual(mockFlag);
    });
  });

  describe('getStats', () => {
    it('should return stats', async () => {
      const result = await service.getStats();
      expect(result.totalConfigs).toBe(4);
      expect(result.totalFlags).toBe(4);
      expect(result.enabledFlags).toBe(2);
      expect(result.disabledFlags).toBe(2);
      expect(result.serverTime).toBeDefined();
    });
  });
});
