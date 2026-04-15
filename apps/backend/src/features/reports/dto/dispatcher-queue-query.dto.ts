import { IsIn, IsOptional } from 'class-validator';

const AI_CATEGORY_VALUES = [
  'WASTE',
  'GREENERY',
  'ROAD_INFRASTRUCTURE',
  'ILLEGAL_PARKING',
  'WATER_SEWER',
  'OTHER',
] as const;

const AI_URGENCY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const REPORT_STATUS_VALUES = ['NEW', 'IN_PROGRESS', 'RESOLVED'] as const;

export type DispatcherQueueCategory = (typeof AI_CATEGORY_VALUES)[number];
export type DispatcherQueueUrgency = (typeof AI_URGENCY_VALUES)[number];
export type DispatcherQueueStatus = (typeof REPORT_STATUS_VALUES)[number];

export class DispatcherQueueQueryDto {
  @IsOptional()
  @IsIn(AI_CATEGORY_VALUES)
  category?: DispatcherQueueCategory;

  @IsOptional()
  @IsIn(AI_URGENCY_VALUES)
  urgency?: DispatcherQueueUrgency;

  @IsOptional()
  @IsIn(REPORT_STATUS_VALUES)
  status?: DispatcherQueueStatus;
}
