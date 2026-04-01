import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiProperty({ description: 'The new value for the config entry' })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'Optional description of the config entry',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
