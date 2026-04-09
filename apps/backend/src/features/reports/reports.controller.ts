import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { DispatcherQueueQueryDto } from './dto/dispatcher-queue-query.dto';
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
  async findDispatcherQueue(
    @Req() req: { user: { id: string } },
    @Query() query: DispatcherQueueQueryDto,
  ) {
    await this.reportsService.ensureDispatcherAccess(req.user.id);
    return this.reportsService.findDispatcherQueue(query);
  }
}
