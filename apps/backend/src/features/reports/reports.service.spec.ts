import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AiTriageService } from './ai-triage.service';
import { ReportsService } from './reports.service';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  report: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  statusHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockAiTriage = {
  classify: jest.fn(),
};

describe('ReportsService — Dispatcher Operations', () => {
  let service: ReportsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiTriageService, useValue: mockAiTriage },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  // -------------------------------------------------------------------------
  // ensureDispatcherAccess
  // -------------------------------------------------------------------------
  describe('ensureDispatcherAccess', () => {
    it('should allow DISPATCHER role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'DISPATCHER' });
      await expect(
        service.ensureDispatcherAccess('user-1'),
      ).resolves.not.toThrow();
    });

    it('should allow ADMIN role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
      await expect(
        service.ensureDispatcherAccess('user-1'),
      ).resolves.not.toThrow();
    });

    it('should reject CITIZEN role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'CITIZEN' });
      await expect(service.ensureDispatcherAccess('user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reject when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.ensureDispatcherAccess('unknown')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // -------------------------------------------------------------------------
  // findDispatcherQueue
  // -------------------------------------------------------------------------
  describe('findDispatcherQueue', () => {
    it('should query with no filters when all are ALL/undefined', async () => {
      mockPrisma.report.findMany.mockResolvedValue([]);
      const result = await service.findDispatcherQueue({});
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(result).toEqual([]);
    });

    it('should filter by category only', async () => {
      const mockReports = [
        { id: '1', title: 'Bin overflow', aiCategory: 'WASTE' },
      ];
      mockPrisma.report.findMany.mockResolvedValue(mockReports);

      const result = await service.findDispatcherQueue({ category: 'WASTE' });
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { aiCategory: 'WASTE' },
        }),
      );
      expect(result).toEqual(mockReports);
    });

    it('should filter by urgency only', async () => {
      mockPrisma.report.findMany.mockResolvedValue([]);
      await service.findDispatcherQueue({ urgency: 'CRITICAL' });
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { aiUrgency: 'CRITICAL' },
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrisma.report.findMany.mockResolvedValue([]);
      await service.findDispatcherQueue({ status: 'IN_PROGRESS' });
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'IN_PROGRESS' },
        }),
      );
    });

    it('should combine category, urgency, and status filters', async () => {
      mockPrisma.report.findMany.mockResolvedValue([]);
      await service.findDispatcherQueue({
        category: 'WASTE',
        urgency: 'HIGH',
        status: 'NEW',
      });
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { aiCategory: 'WASTE', aiUrgency: 'HIGH', status: 'NEW' },
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // findById
  // -------------------------------------------------------------------------
  describe('findById', () => {
    it('should return a report when found', async () => {
      const mockReport = { id: 'r-1', title: 'Pothole', status: 'NEW' };
      mockPrisma.report.findUnique.mockResolvedValue(mockReport);

      const result = await service.findById('r-1');
      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException when report does not exist', async () => {
      mockPrisma.report.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------------------------------------------------------------
  // updateStatus
  // -------------------------------------------------------------------------
  describe('updateStatus', () => {
    it('should transition NEW → IN_PROGRESS', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({
        id: 'r-1',
        status: 'NEW',
      });
      mockPrisma.statusHistory.create.mockResolvedValue({});
      const updatedReport = { id: 'r-1', status: 'IN_PROGRESS' };
      mockPrisma.report.update.mockResolvedValue(updatedReport);

      const result = await service.updateStatus('r-1', 'IN_PROGRESS', 'u-1');
      expect(result).toEqual(updatedReport);
      expect(mockPrisma.statusHistory.create).toHaveBeenCalledWith({
        data: {
          reportId: 'r-1',
          fromStatus: 'NEW',
          toStatus: 'IN_PROGRESS',
          changedBy: 'u-1',
        },
      });
    });

    it('should transition IN_PROGRESS → RESOLVED', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({
        id: 'r-2',
        status: 'IN_PROGRESS',
      });
      mockPrisma.statusHistory.create.mockResolvedValue({});
      mockPrisma.report.update.mockResolvedValue({
        id: 'r-2',
        status: 'RESOLVED',
      });

      const result = await service.updateStatus('r-2', 'RESOLVED', 'u-1');
      expect(result.status).toBe('RESOLVED');
    });

    it('should reject invalid transition NEW → RESOLVED', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({
        id: 'r-3',
        status: 'NEW',
      });

      await expect(
        service.updateStatus('r-3', 'RESOLVED', 'u-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from RESOLVED', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({
        id: 'r-4',
        status: 'RESOLVED',
      });

      await expect(service.updateStatus('r-4', 'NEW', 'u-1')).rejects.toThrow(
        BadRequestException,
      );

      await expect(
        service.updateStatus('r-4', 'IN_PROGRESS', 'u-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for unknown report', async () => {
      mockPrisma.report.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus('no-exist', 'IN_PROGRESS', 'u-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------------------------------------
  // assignUnit
  // -------------------------------------------------------------------------
  describe('assignUnit', () => {
    it('should assign a unit and set assignedAt', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({
        id: 'r-5',
        status: 'IN_PROGRESS',
      });
      mockPrisma.report.update.mockResolvedValue({
        id: 'r-5',
        assignedUnit: 'Waste Management',
        status: 'IN_PROGRESS',
      });

      const result = (await service.assignUnit(
        'r-5',
        'Waste Management',
        'u-1',
      )) as unknown as { assignedUnit: string };
      expect(result.assignedUnit).toBe('Waste Management');
      expect(mockPrisma.report.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'r-5' },
          data: {
            assignedUnit: 'Waste Management',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            assignedAt: expect.any(Date),
          },
        }),
      );
    });

    it('should auto-advance NEW → IN_PROGRESS when assigning', async () => {
      mockPrisma.report.findUnique.mockResolvedValue({
        id: 'r-6',
        status: 'NEW',
      });
      mockPrisma.statusHistory.create.mockResolvedValue({});
      mockPrisma.report.update.mockResolvedValue({
        id: 'r-6',
        assignedUnit: 'Parks & Greenery',
        status: 'IN_PROGRESS',
      });

      const result = (await service.assignUnit(
        'r-6',
        'Parks & Greenery',
        'u-1',
      )) as unknown as { status: string };
      expect(result.status).toBe('IN_PROGRESS');
      expect(mockPrisma.statusHistory.create).toHaveBeenCalledWith({
        data: {
          reportId: 'r-6',
          fromStatus: 'NEW',
          toStatus: 'IN_PROGRESS',
          changedBy: 'u-1',
        },
      });
    });

    it('should throw NotFoundException for unknown report', async () => {
      mockPrisma.report.findUnique.mockResolvedValue(null);
      await expect(
        service.assignUnit('no-exist', 'Some Unit', 'u-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------------------------------------
  // suggestUnit (routing logic)
  // -------------------------------------------------------------------------
  describe('suggestUnit', () => {
    it('should map WASTE to Waste Management', () => {
      expect(service.suggestUnit('WASTE')).toBe('Waste Management');
    });

    it('should map GREENERY to Parks & Greenery', () => {
      expect(service.suggestUnit('GREENERY')).toBe('Parks & Greenery');
    });

    it('should map ROAD_INFRASTRUCTURE to Roads & Infrastructure', () => {
      expect(service.suggestUnit('ROAD_INFRASTRUCTURE')).toBe(
        'Roads & Infrastructure',
      );
    });

    it('should map ILLEGAL_PARKING to Traffic Enforcement', () => {
      expect(service.suggestUnit('ILLEGAL_PARKING')).toBe(
        'Traffic Enforcement',
      );
    });

    it('should map WATER_SEWER to Water & Sewage', () => {
      expect(service.suggestUnit('WATER_SEWER')).toBe('Water & Sewage');
    });

    it('should map OTHER to General Services', () => {
      expect(service.suggestUnit('OTHER')).toBe('General Services');
    });

    it('should return General Services for null category', () => {
      expect(service.suggestUnit(null)).toBe('General Services');
    });
  });

  // -------------------------------------------------------------------------
  // getStats
  // -------------------------------------------------------------------------
  describe('getStats', () => {
    it('should return aggregated counts', async () => {
      // Mock counts
      mockPrisma.report.count
        .mockResolvedValueOnce(5) // NEW
        .mockResolvedValueOnce(3) // IN_PROGRESS
        .mockResolvedValueOnce(2) // RESOLVED
        .mockResolvedValueOnce(1) // LOW
        .mockResolvedValueOnce(3) // MEDIUM
        .mockResolvedValueOnce(4) // HIGH
        .mockResolvedValueOnce(2) // CRITICAL
        .mockResolvedValueOnce(3) // WASTE
        .mockResolvedValueOnce(1) // GREENERY
        .mockResolvedValueOnce(2) // ROAD
        .mockResolvedValueOnce(1) // PARKING
        .mockResolvedValueOnce(1) // WATER
        .mockResolvedValueOnce(2); // OTHER

      // No resolved transitions for avg calculation
      mockPrisma.statusHistory.findMany.mockResolvedValue([]);

      const stats = await service.getStats();

      expect(stats.total).toBe(10);
      expect(stats.byStatus.NEW).toBe(5);
      expect(stats.byStatus.IN_PROGRESS).toBe(3);
      expect(stats.byStatus.RESOLVED).toBe(2);
      expect(stats.byUrgency.HIGH).toBe(4);
      expect(stats.byCategory.WASTE).toBe(3);
      expect(stats.avgResolutionMs).toBeNull();
    });

    it('should calculate average resolution time', async () => {
      // Mock counts (all zeros except RESOLVED)
      mockPrisma.report.count
        .mockResolvedValueOnce(0) // NEW
        .mockResolvedValueOnce(0) // IN_PROGRESS
        .mockResolvedValueOnce(1) // RESOLVED
        .mockResolvedValueOnce(0) // LOW
        .mockResolvedValueOnce(0) // MEDIUM
        .mockResolvedValueOnce(0) // HIGH
        .mockResolvedValueOnce(1) // CRITICAL
        .mockResolvedValueOnce(1) // WASTE
        .mockResolvedValueOnce(0) // GREENERY
        .mockResolvedValueOnce(0) // ROAD
        .mockResolvedValueOnce(0) // PARKING
        .mockResolvedValueOnce(0) // WATER
        .mockResolvedValueOnce(0); // OTHER

      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 3600_000);

      // Resolved transitions
      mockPrisma.statusHistory.findMany
        .mockResolvedValueOnce([{ reportId: 'r-1', changedAt: now }])
        .mockResolvedValueOnce([{ reportId: 'r-1', changedAt: twoHoursAgo }]);

      const stats = await service.getStats();
      expect(stats.avgResolutionMs).toBeGreaterThan(0);
    });

    it('should fall back to report.createdAt when NEW history is missing', async () => {
      mockPrisma.report.count
        .mockResolvedValueOnce(0) // NEW
        .mockResolvedValueOnce(0) // IN_PROGRESS
        .mockResolvedValueOnce(1) // RESOLVED
        .mockResolvedValueOnce(0) // LOW
        .mockResolvedValueOnce(0) // MEDIUM
        .mockResolvedValueOnce(0) // HIGH
        .mockResolvedValueOnce(1) // CRITICAL
        .mockResolvedValueOnce(1) // WASTE
        .mockResolvedValueOnce(0) // GREENERY
        .mockResolvedValueOnce(0) // ROAD
        .mockResolvedValueOnce(0) // PARKING
        .mockResolvedValueOnce(0) // WATER
        .mockResolvedValueOnce(0); // OTHER

      const resolvedAt = new Date();
      const createdAt = new Date(resolvedAt.getTime() - 30 * 60_000);

      mockPrisma.statusHistory.findMany
        .mockResolvedValueOnce([
          { reportId: 'legacy-1', changedAt: resolvedAt },
        ])
        .mockResolvedValueOnce([]);

      mockPrisma.report.findMany.mockResolvedValueOnce([
        { id: 'legacy-1', createdAt },
      ]);

      const stats = await service.getStats();

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['legacy-1'] } },
        select: { id: true, createdAt: true },
      });
      expect(stats.avgResolutionMs).toBeGreaterThan(0);
    });
  });
});
