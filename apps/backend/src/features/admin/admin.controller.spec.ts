import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Reflector } from '@nestjs/core';

describe('AdminController', () => {
  let controller: AdminController;
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

  const mockStats = {
    totalConfigs: 4,
    totalFlags: 4,
    enabledFlags: 2,
    disabledFlags: 2,
    serverTime: new Date().toISOString(),
  };

  const mockAdminService = {
    getStats: jest.fn().mockResolvedValue(mockStats),
    getAllConfigs: jest.fn().mockResolvedValue([mockConfig]),
    getConfigByKey: jest.fn().mockResolvedValue(mockConfig),
    createConfig: jest.fn().mockResolvedValue(mockConfig),
    updateConfig: jest.fn().mockResolvedValue(mockConfig),
    deleteConfig: jest.fn().mockResolvedValue(undefined),
    getAllFeatureFlags: jest.fn().mockResolvedValue([mockFlag]),
    getFeatureFlag: jest.fn().mockResolvedValue(mockFlag),
    updateFeatureFlag: jest.fn().mockResolvedValue(mockFlag),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        Reflector,
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard stats', async () => {
      const result = await controller.getStats();
      expect(result).toEqual(mockStats);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('getAllConfigs', () => {
    it('should return all configs', async () => {
      const result = await controller.getAllConfigs();
      expect(result).toEqual([mockConfig]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getAllConfigs).toHaveBeenCalled();
    });
  });

  describe('getConfig', () => {
    it('should return a single config by key', async () => {
      const result = await controller.getConfig('app.name');
      expect(result).toEqual(mockConfig);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getConfigByKey).toHaveBeenCalledWith('app.name');
    });
  });

  describe('createConfig', () => {
    it('should create a config entry', async () => {
      const dto = { key: 'app.name', value: 'EcoCheck' };
      const result = await controller.createConfig(dto);
      expect(result).toEqual(mockConfig);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.createConfig).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateConfig', () => {
    it('should update a config entry', async () => {
      const dto = { value: 'NewValue' };
      const result = await controller.updateConfig('app.name', dto);
      expect(result).toEqual(mockConfig);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.updateConfig).toHaveBeenCalledWith('app.name', dto);
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config entry', async () => {
      await controller.deleteConfig('app.name');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.deleteConfig).toHaveBeenCalledWith('app.name');
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all feature flags', async () => {
      const result = await controller.getAllFeatureFlags();
      expect(result).toEqual([mockFlag]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getAllFeatureFlags).toHaveBeenCalled();
    });
  });

  describe('updateFeatureFlag', () => {
    it('should toggle a feature flag', async () => {
      const dto = { enabled: false };
      const result = await controller.updateFeatureFlag('eco-scoring', dto);
      expect(result).toEqual(mockFlag);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.updateFeatureFlag).toHaveBeenCalledWith(
        'eco-scoring',
        dto,
      );
    });
  });
});
