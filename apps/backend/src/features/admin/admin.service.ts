import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Config } from './schemas/config.entity';
import { FeatureFlag } from './schemas/feature-flag.entity';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Seed default feature flags if they don't exist yet */
  async onModuleInit() {
    const defaults: { key: string; description: string; enabled: boolean }[] = [
      {
        key: 'eco-scoring',
        description: 'Enable the eco scoring engine for signals',
        enabled: true,
      },
      {
        key: 'ai-classification',
        description: 'Enable AI-based signal classification via Gemini',
        enabled: true,
      },
      {
        key: 'reports',
        description: 'Enable the reports & exports module',
        enabled: false,
      },
      {
        key: 'notifications',
        description: 'Enable push / email notifications',
        enabled: false,
      },
    ];

    for (const def of defaults) {
      await this.prisma.featureFlag.upsert({
        where: { key: def.key },
        update: {},
        create: def,
      });
      this.logger.log(`Seeded feature flag: ${def.key}`);
    }

    // Seed default config entries
    const configDefaults: {
      key: string;
      value: string;
      description: string;
    }[] = [
      {
        key: 'app.name',
        value: 'EcoCheck',
        description: 'Application display name',
      },
      {
        key: 'app.maxSignalsPerUser',
        value: '50',
        description: 'Maximum signals a single user can submit per day',
      },
      {
        key: 'app.supportEmail',
        value: 'support@ecocheck.local',
        description: 'Support contact email address',
      },
      {
        key: 'ai.confidenceThreshold',
        value: '0.75',
        description:
          'Minimum confidence score for AI classification to be accepted',
      },
    ];

    for (const cfg of configDefaults) {
      await this.prisma.config.upsert({
        where: { key: cfg.key },
        update: {},
        create: cfg,
      });
      this.logger.log(`Seeded config: ${cfg.key}`);
    }
  }

  // ── Config CRUD ──────────────────────────────────────────────

  getAllConfigs(): Promise<Config[]> {
    return this.prisma.config.findMany({ orderBy: { key: 'asc' } });
  }

  async getConfigByKey(key: string): Promise<Config> {
    const config = await this.prisma.config.findUnique({ where: { key } });
    if (!config) throw new NotFoundException(`Config "${key}" not found`);
    return config;
  }

  createConfig(dto: CreateConfigDto): Promise<Config> {
    return this.prisma.config.create({
      data: {
        key: dto.key,
        value: dto.value,
        description: dto.description ?? '',
      },
    });
  }

  async updateConfig(key: string, dto: UpdateConfigDto): Promise<Config> {
    const oldConfig = await this.getConfigByKey(key);
    const updated = await this.prisma.config.update({
      where: { key },
      data: {
        value: dto.value,
        description: dto.description,
      },
    });

    await this.logAction({
      action: 'CONFIG_UPDATED',
      entity: 'Config',
      entityId: key,
      oldValue: JSON.stringify({
        value: oldConfig.value,
        description: oldConfig.description,
      }),
      newValue: JSON.stringify({
        value: updated.value,
        description: updated.description,
      }),
    });

    return updated;
  }

  async deleteConfig(key: string): Promise<void> {
    const oldConfig = await this.getConfigByKey(key);
    await this.prisma.config.delete({ where: { key } });

    await this.logAction({
      action: 'CONFIG_DELETED',
      entity: 'Config',
      entityId: key,
      oldValue: JSON.stringify(oldConfig),
    });
  }

  // ── Feature Flags ────────────────────────────────────────────

  getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) {
      throw new NotFoundException(`Feature flag "${key}" not found`);
    }
    return flag;
  }

  async updateFeatureFlag(
    key: string,
    dto: UpdateFeatureFlagDto,
  ): Promise<FeatureFlag> {
    const oldFlag = await this.getFeatureFlag(key);
    const updated = await this.prisma.featureFlag.update({
      where: { key },
      data: {
        enabled: dto.enabled,
        description: dto.description,
      },
    });

    await this.logAction({
      action: 'FLAG_TOGGLED',
      entity: 'FeatureFlag',
      entityId: key,
      oldValue: JSON.stringify({
        enabled: oldFlag.enabled,
        description: oldFlag.description,
      }),
      newValue: JSON.stringify({
        enabled: updated.enabled,
        description: updated.description,
      }),
    });

    return updated;
  }

  // ── Stats & Activity ─────────────────────────────────────────

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getStats() {
    const totalConfigs = await this.prisma.config.count();
    const totalFlags = await this.prisma.featureFlag.count();
    const enabledFlags = await this.prisma.featureFlag.count({
      where: {
        enabled: true,
      },
    });

    return {
      totalConfigs,
      totalFlags,
      enabledFlags,
      disabledFlags: totalFlags - enabledFlags,
      serverTime: new Date().toISOString(),
    };
  }

  private async logAction(data: {
    action: string;
    entity: string;
    entityId: string;
    oldValue?: string;
    newValue?: string;
    userId?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          oldValue: data.oldValue,
          newValue: data.newValue,
          userId: data.userId ?? 'system-admin', // Default for MVP
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create audit log: ${message}`);
    }
  }
}
