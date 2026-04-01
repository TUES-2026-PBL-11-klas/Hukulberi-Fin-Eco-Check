import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFeatureFlagDto {
  @ApiProperty({ description: 'Whether the feature flag is enabled' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Optional description of the feature flag',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
