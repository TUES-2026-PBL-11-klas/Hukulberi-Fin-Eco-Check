import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiHeader } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Config } from './schemas/config.entity';
import { FeatureFlag } from './schemas/feature-flag.entity';

@ApiTags('Admin')
@ApiHeader({
  name: 'x-user-role',
  description: 'Role of the requesting user (e.g. "admin")',
  required: true,
})
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Stats ────────────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getStats(): Promise<{
    totalConfigs: number;
    totalFlags: number;
    enabledFlags: number;
    disabledFlags: number;
    serverTime: string;
  }> {
    return this.adminService.getStats();
  }

  // ── Configs ──────────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Get all configuration entries' })
  async getAllConfigs(): Promise<Config[]> {
    return this.adminService.getAllConfigs();
  }

  @Get('config/:key')
  @ApiOperation({ summary: 'Get a single config entry by key' })
  @ApiParam({ name: 'key', description: 'Config key' })
  async getConfig(@Param('key') key: string): Promise<Config> {
    return this.adminService.getConfigByKey(key);
  }

  @Post('config')
  @ApiOperation({ summary: 'Create a new config entry' })
  async createConfig(@Body() dto: CreateConfigDto): Promise<Config> {
    return this.adminService.createConfig(dto);
  }

  @Patch('config/:key')
  @ApiOperation({ summary: 'Update a config entry' })
  @ApiParam({ name: 'key', description: 'Config key' })
  async updateConfig(
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
  ): Promise<Config> {
    return this.adminService.updateConfig(key, dto);
  }

  @Delete('config/:key')
  @ApiOperation({ summary: 'Delete a config entry' })
  @ApiParam({ name: 'key', description: 'Config key' })
  async deleteConfig(@Param('key') key: string): Promise<void> {
    return this.adminService.deleteConfig(key);
  }

  // ── Feature Flags ────────────────────────────────────────────

  @Get('feature-flags')
  @ApiOperation({ summary: 'Get all feature flags' })
  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return this.adminService.getAllFeatureFlags();
  }

  @Get('feature-flags/:key')
  @ApiOperation({ summary: 'Get a single feature flag by key' })
  @ApiParam({ name: 'key', description: 'Feature flag key' })
  async getFeatureFlag(@Param('key') key: string): Promise<FeatureFlag> {
    return this.adminService.getFeatureFlag(key);
  }

  @Patch('feature-flags/:key')
  @ApiOperation({ summary: 'Toggle a feature flag' })
  @ApiParam({ name: 'key', description: 'Feature flag key' })
  async updateFeatureFlag(
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
  ): Promise<FeatureFlag> {
    return this.adminService.updateFeatureFlag(key, dto);
  }
}
