import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './schemas/config.entity';
import { FeatureFlag } from './schemas/feature-flag.entity';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Config)
    private readonly configRepo: Repository<Config>,
    @InjectRepository(FeatureFlag)
    private readonly featureFlagRepo: Repository<FeatureFlag>,
  ) {}

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
      const exists = await this.featureFlagRepo.findOneBy({ key: def.key });
      if (!exists) {
        await this.featureFlagRepo.save(this.featureFlagRepo.create(def));
        this.logger.log(`Seeded feature flag: ${def.key}`);
      }
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
      const exists = await this.configRepo.findOneBy({ key: cfg.key });
      if (!exists) {
        await this.configRepo.save(this.configRepo.create(cfg));
        this.logger.log(`Seeded config: ${cfg.key}`);
      }
    }
  }

  // ── Config CRUD ──────────────────────────────────────────────

  async getAllConfigs(): Promise<Config[]> {
    return this.configRepo.find({ order: { key: 'ASC' } });
  }

  async getConfigByKey(key: string): Promise<Config> {
    const config = await this.configRepo.findOneBy({ key });
    if (!config) throw new NotFoundException(`Config "${key}" not found`);
    return config;
  }

  async createConfig(dto: CreateConfigDto): Promise<Config> {
    const config = this.configRepo.create(dto);
    return this.configRepo.save(config);
  }

  async updateConfig(key: string, dto: UpdateConfigDto): Promise<Config> {
    const config = await this.getConfigByKey(key);
    Object.assign(config, dto);
    return this.configRepo.save(config);
  }

  async deleteConfig(key: string): Promise<void> {
    const config = await this.getConfigByKey(key);
    await this.configRepo.remove(config);
  }

  // ── Feature Flags ────────────────────────────────────────────

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return this.featureFlagRepo.find({ order: { key: 'ASC' } });
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag> {
    const flag = await this.featureFlagRepo.findOneBy({ key });
    if (!flag) {
      throw new NotFoundException(`Feature flag "${key}" not found`);
    }
    return flag;
  }

  async updateFeatureFlag(
    key: string,
    dto: UpdateFeatureFlagDto,
  ): Promise<FeatureFlag> {
    const flag = await this.getFeatureFlag(key);
    Object.assign(flag, dto);
    return this.featureFlagRepo.save(flag);
  }

  // ── Stats ────────────────────────────────────────────────────

  async getStats() {
    const totalConfigs = await this.configRepo.count();
    const totalFlags = await this.featureFlagRepo.count();
    const enabledFlags = await this.featureFlagRepo.countBy({
      enabled: true,
    });

    return {
      totalConfigs,
      totalFlags,
      enabledFlags,
      disabledFlags: totalFlags - enabledFlags,
      serverTime: new Date().toISOString(),
    };
  }
}
