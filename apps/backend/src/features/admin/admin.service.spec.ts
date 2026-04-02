import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';

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

  const mockPrisma = {
    config: {
      findMany: jest.fn().mockResolvedValue([mockConfig]),
      findUnique: jest.fn().mockResolvedValue(mockConfig),
      create: jest.fn().mockResolvedValue(mockConfig),
      update: jest.fn().mockResolvedValue(mockConfig),
      delete: jest.fn().mockResolvedValue(mockConfig),
      count: jest.fn().mockResolvedValue(4),
      upsert: jest.fn().mockResolvedValue(mockConfig),
    },
    featureFlag: {
      findMany: jest.fn().mockResolvedValue([mockFlag]),
      findUnique: jest.fn().mockResolvedValue(mockFlag),
      update: jest.fn().mockResolvedValue(mockFlag),
      count: jest.fn().mockResolvedValue(4),
      upsert: jest.fn().mockResolvedValue(mockFlag),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
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
      expect(mockPrisma.config.findMany).toHaveBeenCalledWith({
        orderBy: { key: 'asc' },
      });
    });
  });

  describe('getConfigByKey', () => {
    it('should return a config by key', async () => {
      const result = await service.getConfigByKey('app.name');
      expect(result).toEqual(mockConfig);
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrisma.config.findUnique.mockResolvedValueOnce(null);
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
      expect(mockPrisma.config.create).toHaveBeenCalledWith({
        data: {
          key: 'app.name',
          value: 'EcoCheck',
          description: '',
        },
      });
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
      expect(mockPrisma.config.delete).toHaveBeenCalledWith({
        where: { key: 'app.name' },
      });
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
      mockPrisma.featureFlag.findUnique.mockResolvedValueOnce(null);
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
      mockPrisma.featureFlag.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(2);

      const result = await service.getStats();
      expect(result.totalConfigs).toBe(4);
      expect(result.totalFlags).toBe(4);
      expect(result.enabledFlags).toBe(2);
      expect(result.disabledFlags).toBe(2);
      expect(result.serverTime).toBeDefined();
    });
  });
});
