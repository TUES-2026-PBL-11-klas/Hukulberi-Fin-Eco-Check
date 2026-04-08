import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiTriageService } from './ai-triage.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [ConfigModule],
  controllers: [ReportsController],
  providers: [ReportsService, AiTriageService],
})
export class ReportsModule {}
