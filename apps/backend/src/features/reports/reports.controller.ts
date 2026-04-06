import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(req.user.id, dto);
  }

  @Get('my')
  findMy(@Req() req: { user: { id: string } }) {
    return this.reportsService.findAllByUser(req.user.id);
  }
}
