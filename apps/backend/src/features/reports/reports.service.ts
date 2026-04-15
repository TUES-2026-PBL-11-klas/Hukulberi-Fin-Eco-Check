import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiTriageService } from './ai-triage.service';
import { CreateReportDto } from './dto/create-report.dto';
import { DispatcherQueueQueryDto } from './dto/dispatcher-queue-query.dto';

type TriageStatus = 'PENDING' | 'TRIAGED' | 'FAILED';
type AiCategory =
  | 'WASTE'
  | 'GREENERY'
  | 'ROAD_INFRASTRUCTURE'
  | 'ILLEGAL_PARKING'
  | 'WATER_SEWER'
  | 'OTHER';
type AiUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ReportStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

type ReportDetail = {
  id: string;
  title: string;
  description: string;
  location: string;
  photoUrl: string | null;
  status: string;
  triageStatus: TriageStatus;
  aiCategory: AiCategory | null;
  aiUrgency: AiUrgency | null;
  aiConfidence: number | null;
  aiReasoning: string | null;
  triagedAt: Date | null;
  createdAt: Date;
};

type ReportListItem = {
  id: string;
  title: string;
  location: string;
  status: string;
  triageStatus: TriageStatus;
  aiCategory: AiCategory | null;
  aiUrgency: AiUrgency | null;
  aiConfidence: number | null;
  aiReasoning: string | null;
  createdAt: Date;
};

type DispatcherQueueItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  triageStatus: TriageStatus;
  aiCategory: AiCategory | null;
  aiUrgency: AiUrgency | null;
  aiConfidence: number | null;
  assignedUnit: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type StatusHistoryRecord = {
  reportId: string;
  changedAt: Date;
};

type StatusHistoryDelegate = {
  create(args: {
    data: {
      reportId: string;
      fromStatus: ReportStatus | null;
      toStatus: ReportStatus;
      changedBy: string;
    };
  }): Promise<unknown>;
  findMany(args: {
    where: {
      toStatus: ReportStatus;
      reportId?: { in: string[] };
    };
    select: {
      reportId: true;
      changedAt: true;
    };
  }): Promise<StatusHistoryRecord[]>;
};

type ReportModelDelegate = {
  create(args: {
    data: {
      title: string;
      description: string;
      location: string;
      photoUrl?: string;
      userId: string;
    };
    select: {
      id: true;
      title: true;
      description: true;
      location: true;
      photoUrl: true;
      status: true;
      triageStatus: true;
      aiCategory: true;
      aiUrgency: true;
      aiConfidence: true;
      aiReasoning: true;
      triagedAt: true;
      createdAt: true;
    };
  }): Promise<ReportDetail>;
  findMany(args: {
    where: { userId: string };
    orderBy: { createdAt: 'desc' };
    select: {
      id: true;
      title: true;
      location: true;
      status: true;
      triageStatus: true;
      aiCategory: true;
      aiUrgency: true;
      aiConfidence: true;
      aiReasoning: true;
      createdAt: true;
    };
  }): Promise<ReportListItem[]>;
  findMany(args: {
    where: {
      aiCategory?: AiCategory;
      aiUrgency?: AiUrgency;
      status?: ReportStatus;
    };
    orderBy: { createdAt: 'desc' };
    select: {
      id: true;
      title: true;
      description: true;
      location: true;
      status: true;
      triageStatus: true;
      aiCategory: true;
      aiUrgency: true;
      aiConfidence: true;
      assignedUnit: true;
      createdAt: true;
      updatedAt: true;
    };
  }): Promise<DispatcherQueueItem[]>;
  findUnique(args: {
    where: { id: string };
    select: Record<string, true>;
  }): Promise<Record<string, unknown> | null>;
  update(args: {
    where: { id: string };
    data: Record<string, unknown>;
    select: Record<string, true>;
  }): Promise<Record<string, unknown>>;
};

/** Maps AI categories to municipal unit names for routing */
const CATEGORY_UNIT_MAP: Record<AiCategory, string> = {
  WASTE: 'Waste Management',
  GREENERY: 'Parks & Greenery',
  ROAD_INFRASTRUCTURE: 'Roads & Infrastructure',
  ILLEGAL_PARKING: 'Traffic Enforcement',
  WATER_SEWER: 'Water & Sewage',
  OTHER: 'General Services',
};

/** Valid status transitions — forward-only for now */
const VALID_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  NEW: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
};

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private hasLoggedMissingStatusHistoryDelegate = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiTriageService: AiTriageService,
  ) {}

  private get reportModel(): ReportModelDelegate {
    return (this.prisma as unknown as { report: ReportModelDelegate }).report;
  }

  // ---------------------------------------------------------------------------
  // Report creation (Darian's flow)
  // ---------------------------------------------------------------------------

  async create(userId: string, dto: CreateReportDto) {
    const normalizedPhotoUrl = dto.photoUrl?.trim();

    if (
      normalizedPhotoUrl &&
      !this.isSupportedPhotoPayload(normalizedPhotoUrl)
    ) {
      throw new BadRequestException(
        'Photo must be an image URL or an attached image file.',
      );
    }

    const report = await this.reportModel.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        photoUrl: normalizedPhotoUrl,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        photoUrl: true,
        status: true,
        triageStatus: true,
        aiCategory: true,
        aiUrgency: true,
        aiConfidence: true,
        aiReasoning: true,
        triagedAt: true,
        createdAt: true,
      },
    });

    // Record the initial status in history
    await this.createStatusHistory(report.id, null, 'NEW', userId);

    return this.triageReport(report.id, dto);
  }

  findAllByUser(userId: string) {
    return this.reportModel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        location: true,
        status: true,
        triageStatus: true,
        aiCategory: true,
        aiUrgency: true,
        aiConfidence: true,
        aiReasoning: true,
        createdAt: true,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Dispatcher access check
  // ---------------------------------------------------------------------------

  async ensureDispatcherAccess(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['DISPATCHER', 'ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Dispatcher access required');
    }
  }

  // ---------------------------------------------------------------------------
  // Dispatcher queue (Georgi's enhanced version)
  // ---------------------------------------------------------------------------

  findDispatcherQueue(query: DispatcherQueueQueryDto) {
    const where: {
      aiCategory?: AiCategory;
      aiUrgency?: AiUrgency;
      status?: ReportStatus;
    } = {};

    if (query.category) {
      where.aiCategory = query.category;
    }

    if (query.urgency) {
      where.aiUrgency = query.urgency;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.reportModel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        status: true,
        triageStatus: true,
        aiCategory: true,
        aiUrgency: true,
        aiConfidence: true,
        assignedUnit: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Single report detail (Georgi)
  // ---------------------------------------------------------------------------

  async findById(reportId: string) {
    const report = await this.reportModel.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        photoUrl: true,
        status: true,
        triageStatus: true,
        aiCategory: true,
        aiUrgency: true,
        aiConfidence: true,
        aiReasoning: true,
        triagedAt: true,
        assignedUnit: true,
        assignedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    return report;
  }

  // ---------------------------------------------------------------------------
  // Status update (Georgi)
  // ---------------------------------------------------------------------------

  async updateStatus(
    reportId: string,
    newStatus: ReportStatus,
    userId: string,
  ) {
    const report = await this.reportModel.findUnique({
      where: { id: reportId },
      select: { id: true, status: true },
    });

    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    const currentStatus = report.status as ReportStatus;
    const allowedNext = VALID_TRANSITIONS[currentStatus];

    if (!allowedNext.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedNext.join(', ') || 'none'}`,
      );
    }

    // Record the status transition
    await this.createStatusHistory(reportId, currentStatus, newStatus, userId);

    const updated = await this.reportModel.update({
      where: { id: reportId },
      data: { status: newStatus },
      select: this.reportDetailSelect,
    });

    this.logger.log(
      `Report ${reportId}: ${currentStatus} → ${newStatus} by user ${userId}`,
    );

    return updated;
  }

  // ---------------------------------------------------------------------------
  // Unit assignment + routing (Georgi)
  // ---------------------------------------------------------------------------

  async assignUnit(reportId: string, unit: string, userId: string) {
    const report = await this.reportModel.findUnique({
      where: { id: reportId },
      select: { id: true, status: true },
    });

    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    const currentStatus = report.status as ReportStatus;
    const data: Record<string, unknown> = {
      assignedUnit: unit,
      assignedAt: new Date(),
    };

    // Auto-advance to IN_PROGRESS when assigning a unit to a NEW report
    if (currentStatus === 'NEW') {
      data.status = 'IN_PROGRESS';
      await this.createStatusHistory(
        reportId,
        currentStatus,
        'IN_PROGRESS',
        userId,
      );
      this.logger.log(
        `Report ${reportId}: auto-advanced NEW → IN_PROGRESS on unit assignment`,
      );
    }

    const updated = await this.reportModel.update({
      where: { id: reportId },
      data,
      select: this.reportDetailSelect,
    });

    this.logger.log(
      `Report ${reportId}: assigned to "${unit}" by user ${userId}`,
    );

    return updated;
  }

  /** Routing logic: suggest a municipal unit based on AI category */
  suggestUnit(category: AiCategory | null): string {
    if (!category) return CATEGORY_UNIT_MAP.OTHER;
    return CATEGORY_UNIT_MAP[category] ?? CATEGORY_UNIT_MAP.OTHER;
  }

  // ---------------------------------------------------------------------------
  // Analytics / reporting (Georgi)
  // ---------------------------------------------------------------------------

  async getStats() {
    const prismaAny = this.prisma as unknown as {
      report: {
        count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
      };
    };

    // Count by status
    const [totalNew, totalInProgress, totalResolved] = await Promise.all([
      prismaAny.report.count({ where: { status: 'NEW' } }),
      prismaAny.report.count({ where: { status: 'IN_PROGRESS' } }),
      prismaAny.report.count({ where: { status: 'RESOLVED' } }),
    ]);

    // Count by urgency
    const [countLow, countMedium, countHigh, countCritical] = await Promise.all(
      [
        prismaAny.report.count({ where: { aiUrgency: 'LOW' } }),
        prismaAny.report.count({ where: { aiUrgency: 'MEDIUM' } }),
        prismaAny.report.count({ where: { aiUrgency: 'HIGH' } }),
        prismaAny.report.count({ where: { aiUrgency: 'CRITICAL' } }),
      ],
    );

    // Count by category
    const [
      countWaste,
      countGreenery,
      countRoad,
      countParking,
      countWater,
      countOther,
    ] = await Promise.all([
      prismaAny.report.count({ where: { aiCategory: 'WASTE' } }),
      prismaAny.report.count({ where: { aiCategory: 'GREENERY' } }),
      prismaAny.report.count({
        where: { aiCategory: 'ROAD_INFRASTRUCTURE' },
      }),
      prismaAny.report.count({ where: { aiCategory: 'ILLEGAL_PARKING' } }),
      prismaAny.report.count({ where: { aiCategory: 'WATER_SEWER' } }),
      prismaAny.report.count({ where: { aiCategory: 'OTHER' } }),
    ]);

    const baseStats = {
      total: totalNew + totalInProgress + totalResolved,
      byStatus: {
        NEW: totalNew,
        IN_PROGRESS: totalInProgress,
        RESOLVED: totalResolved,
      },
      byUrgency: {
        LOW: countLow,
        MEDIUM: countMedium,
        HIGH: countHigh,
        CRITICAL: countCritical,
      },
      byCategory: {
        WASTE: countWaste,
        GREENERY: countGreenery,
        ROAD_INFRASTRUCTURE: countRoad,
        ILLEGAL_PARKING: countParking,
        WATER_SEWER: countWater,
        OTHER: countOther,
      },
    };

    const statusHistory = this.getStatusHistoryDelegate();
    if (!statusHistory) {
      this.logMissingStatusHistoryDelegate();
      return {
        ...baseStats,
        avgResolutionMs: null,
      };
    }

    // Average resolution time from status history
    const resolvedTransitions = await statusHistory.findMany({
      where: { toStatus: 'RESOLVED' },
      select: { reportId: true, changedAt: true },
    });

    let avgResolutionMs: number | null = null;

    if (resolvedTransitions.length > 0) {
      // For each resolved report, find the creation entry (toStatus = NEW)
      const creationTransitions = await statusHistory.findMany({
        where: {
          toStatus: 'NEW',
          reportId: {
            in: resolvedTransitions.map((t) => t.reportId),
          },
        },
        select: { reportId: true, changedAt: true },
      });

      const creationMap = new Map<string, Date>();
      for (const t of creationTransitions) {
        creationMap.set(t.reportId, t.changedAt);
      }

      let totalMs = 0;
      let count = 0;
      for (const resolved of resolvedTransitions) {
        const created = creationMap.get(resolved.reportId);
        if (created) {
          totalMs +=
            new Date(resolved.changedAt).getTime() -
            new Date(created).getTime();
          count++;
        }
      }

      if (count > 0) {
        avgResolutionMs = Math.round(totalMs / count);
      }
    }

    return {
      ...baseStats,
      avgResolutionMs,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async triageReport(reportId: string, dto: CreateReportDto) {
    try {
      const triage = await this.aiTriageService.classify({
        title: dto.title,
        description: dto.description,
        location: dto.location,
      });

      return await this.reportModel.update({
        where: { id: reportId },
        data: {
          triageStatus: 'TRIAGED' satisfies TriageStatus,
          aiCategory: triage.category,
          aiUrgency: triage.urgency,
          aiConfidence: triage.confidence,
          aiReasoning: triage.reasoning,
          triagedAt: new Date(),
        },
        select: this.reportDetailSelect,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown triage error from Gemini service';

      this.logger.warn(`Triage failed for report ${reportId}: ${message}`);

      return this.reportModel.update({
        where: { id: reportId },
        data: {
          triageStatus: 'FAILED' satisfies TriageStatus,
          aiReasoning: message.slice(0, 220),
          triagedAt: new Date(),
        },
        select: this.reportDetailSelect,
      });
    }
  }

  private async createStatusHistory(
    reportId: string,
    fromStatus: ReportStatus | null,
    toStatus: ReportStatus,
    changedBy: string,
  ) {
    const statusHistory = this.getStatusHistoryDelegate();
    if (!statusHistory) {
      this.logMissingStatusHistoryDelegate();
      return;
    }

    await statusHistory.create({
      data: { reportId, fromStatus, toStatus, changedBy },
    });
  }

  private getStatusHistoryDelegate(): StatusHistoryDelegate | null {
    const candidate = (
      this.prisma as unknown as {
        statusHistory?: Partial<StatusHistoryDelegate>;
      }
    ).statusHistory;

    if (
      !candidate ||
      typeof candidate.create !== 'function' ||
      typeof candidate.findMany !== 'function'
    ) {
      return null;
    }

    return candidate as StatusHistoryDelegate;
  }

  private logMissingStatusHistoryDelegate() {
    if (this.hasLoggedMissingStatusHistoryDelegate) {
      return;
    }

    this.hasLoggedMissingStatusHistoryDelegate = true;
    this.logger.warn(
      'Prisma statusHistory delegate is unavailable; status history writes and resolution-time analytics are disabled. Run "npm run prisma:generate -w apps/backend" and restart the backend.',
    );
  }

  private isSupportedPhotoPayload(photo: string): boolean {
    if (/^https?:\/\/\S+/i.test(photo)) {
      return true;
    }

    return photo.startsWith('data:image/') && photo.includes(';base64,');
  }

  private readonly reportDetailSelect = {
    id: true,
    title: true,
    description: true,
    location: true,
    photoUrl: true,
    status: true,
    triageStatus: true,
    aiCategory: true,
    aiUrgency: true,
    aiConfidence: true,
    aiReasoning: true,
    triagedAt: true,
    assignedUnit: true,
    assignedAt: true,
    createdAt: true,
  } as const;
}
