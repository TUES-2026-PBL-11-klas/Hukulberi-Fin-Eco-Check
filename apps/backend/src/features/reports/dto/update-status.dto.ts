import { IsIn } from 'class-validator';

const REPORT_STATUS_VALUES = ['NEW', 'IN_PROGRESS', 'RESOLVED'] as const;
export type ReportStatusValue = (typeof REPORT_STATUS_VALUES)[number];

export class UpdateStatusDto {
  @IsIn(REPORT_STATUS_VALUES)
  status!: ReportStatusValue;
}
