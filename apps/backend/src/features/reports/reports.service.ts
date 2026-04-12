import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
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
    };
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
      assignedUnit: true;
      createdAt: true;
      updatedAt: true;
    };
  }): Promise<DispatcherQueueItem[]>;
  update(args: {
    where: { id: string };
    data: {
      triageStatus: TriageStatus;
      aiCategory?: AiCategory;
      aiUrgency?: AiUrgency;
      aiConfidence?: number;
      aiReasoning?: string;
      triagedAt: Date;
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
};

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiTriageService: AiTriageService,
  ) {}

  private get reportModel(): ReportModelDelegate {
    return (this.prisma as unknown as { report: ReportModelDelegate }).report;
  }

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

  async ensureDispatcherAccess(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['DISPATCHER', 'ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Dispatcher access required');
    }
  }

  findDispatcherQueue(query: DispatcherQueueQueryDto) {
    const where: {
      aiCategory?: AiCategory;
      aiUrgency?: AiUrgency;
    } = {};

    if (query.category) {
      where.aiCategory = query.category;
    }

    if (query.urgency) {
      where.aiUrgency = query.urgency;
    }

    return this.reportModel.findMany({
      where,
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
        assignedUnit: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

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
    createdAt: true,
  } as const;
}
