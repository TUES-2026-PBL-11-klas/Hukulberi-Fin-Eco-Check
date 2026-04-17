import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

const mockReportsService = {
  create: jest.fn(),
  findAllByUser: jest.fn(),
  ensureDispatcherAccess: jest.fn(),
  getStats: jest.fn(),
  findDispatcherQueue: jest.fn(),
  findById: jest.fn(),
  updateStatus: jest.fn(),
  assignUnit: jest.fn(),
};

describe('ReportsController', () => {
  let controller: ReportsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: mockReportsService }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should create report for authenticated user', async () => {
    const req = { user: { id: 'u-1' } };
    const dto = {
      title: 'Broken branch',
      description: 'Large branch blocking walkway',
      location: 'Sofia Center',
      photoUrl: undefined,
    };

    const expected = { id: 'r-1' };
    mockReportsService.create.mockResolvedValue(expected);

    await expect(controller.create(req, dto)).resolves.toEqual(expected);
    expect(mockReportsService.create).toHaveBeenCalledWith('u-1', dto);
  });

  it('should return reports for current user', async () => {
    const req = { user: { id: 'u-2' } };
    const expected = [{ id: 'r-1' }];

    mockReportsService.findAllByUser.mockResolvedValue(expected);

    await expect(controller.findMy(req)).resolves.toEqual(expected);
    expect(mockReportsService.findAllByUser).toHaveBeenCalledWith('u-2');
  });

  it('should validate dispatcher access before returning stats', async () => {
    const req = { user: { id: 'd-1' } };
    const expected = { total: 10 };

    mockReportsService.ensureDispatcherAccess.mockResolvedValue(undefined);
    mockReportsService.getStats.mockResolvedValue(expected);

    await expect(controller.getStats(req)).resolves.toEqual(expected);
    expect(mockReportsService.ensureDispatcherAccess).toHaveBeenCalledWith(
      'd-1',
    );
    expect(mockReportsService.getStats).toHaveBeenCalled();
  });

  it('should validate dispatcher access before returning dispatcher queue', async () => {
    const req = { user: { id: 'd-2' } };
    const query = { category: 'WASTE', urgency: 'HIGH', status: 'NEW' };
    const expected = [{ id: 'r-queue' }];

    mockReportsService.ensureDispatcherAccess.mockResolvedValue(undefined);
    mockReportsService.findDispatcherQueue.mockResolvedValue(expected);

    await expect(controller.findDispatcherQueue(req, query)).resolves.toEqual(
      expected,
    );
    expect(mockReportsService.ensureDispatcherAccess).toHaveBeenCalledWith(
      'd-2',
    );
    expect(mockReportsService.findDispatcherQueue).toHaveBeenCalledWith(query);
  });

  it('should validate dispatcher access before returning single report', async () => {
    const req = { user: { id: 'd-3' } };
    const expected = { id: 'r-9' };

    mockReportsService.ensureDispatcherAccess.mockResolvedValue(undefined);
    mockReportsService.findById.mockResolvedValue(expected);

    await expect(controller.findOne(req, 'r-9')).resolves.toEqual(expected);
    expect(mockReportsService.ensureDispatcherAccess).toHaveBeenCalledWith(
      'd-3',
    );
    expect(mockReportsService.findById).toHaveBeenCalledWith('r-9');
  });

  it('should validate dispatcher access before updating status', async () => {
    const req = { user: { id: 'd-4' } };
    const dto = { status: 'IN_PROGRESS' as const };
    const expected = { id: 'r-10', status: 'IN_PROGRESS' };

    mockReportsService.ensureDispatcherAccess.mockResolvedValue(undefined);
    mockReportsService.updateStatus.mockResolvedValue(expected);

    await expect(controller.updateStatus(req, 'r-10', dto)).resolves.toEqual(
      expected,
    );
    expect(mockReportsService.ensureDispatcherAccess).toHaveBeenCalledWith(
      'd-4',
    );
    expect(mockReportsService.updateStatus).toHaveBeenCalledWith(
      'r-10',
      'IN_PROGRESS',
      'd-4',
    );
  });

  it('should validate dispatcher access before assigning unit', async () => {
    const req = { user: { id: 'd-5' } };
    const dto = { unit: 'Waste Management' };
    const expected = { id: 'r-11', assignedUnit: 'Waste Management' };

    mockReportsService.ensureDispatcherAccess.mockResolvedValue(undefined);
    mockReportsService.assignUnit.mockResolvedValue(expected);

    await expect(controller.assignUnit(req, 'r-11', dto)).resolves.toEqual(
      expected,
    );
    expect(mockReportsService.ensureDispatcherAccess).toHaveBeenCalledWith(
      'd-5',
    );
    expect(mockReportsService.assignUnit).toHaveBeenCalledWith(
      'r-11',
      'Waste Management',
      'd-5',
    );
  });
});
