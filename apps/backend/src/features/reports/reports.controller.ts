import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AssignUnitDto } from './dto/assign-unit.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { DispatcherQueueQueryDto } from './dto/dispatcher-queue-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateReportDto) {
    return this.reportsService.create(req.user.id, dto);
  }

  @Get('my')
  findMy(@Req() req: { user: { id: string } }) {
    return this.reportsService.findAllByUser(req.user.id);
  }

  @Get('stats')
  async getStats(@Req() req: { user: { id: string } }) {
    await this.reportsService.ensureDispatcherAccess(req.user.id);
    return this.reportsService.getStats();
  }

  @Get('dispatcher/queue')
  @ApiQuery({
    name: 'category',
    required: false,
    enum: [
      'WASTE',
      'GREENERY',
      'ROAD_INFRASTRUCTURE',
      'ILLEGAL_PARKING',
      'WATER_SEWER',
      'OTHER',
    ],
  })
  @ApiQuery({
    name: 'urgency',
    required: false,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['NEW', 'IN_PROGRESS', 'RESOLVED'],
  })
  async findDispatcherQueue(
    @Req() req: { user: { id: string } },
    @Query() query: DispatcherQueueQueryDto,
  ) {
    await this.reportsService.ensureDispatcherAccess(req.user.id);
    return this.reportsService.findDispatcherQueue(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Report UUID' })
  async findOne(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    await this.reportsService.ensureDispatcherAccess(req.user.id);
    return this.reportsService.findById(id);
  }

  @Patch(':id/status')
  @ApiParam({ name: 'id', description: 'Report UUID' })
  async updateStatus(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    await this.reportsService.ensureDispatcherAccess(req.user.id);
    return this.reportsService.updateStatus(id, dto.status, req.user.id);
  }

  @Patch(':id/assign')
  @ApiParam({ name: 'id', description: 'Report UUID' })
  async assignUnit(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: AssignUnitDto,
  ) {
    await this.reportsService.ensureDispatcherAccess(req.user.id);
    return this.reportsService.assignUnit(id, dto.unit, req.user.id);
  }
}
