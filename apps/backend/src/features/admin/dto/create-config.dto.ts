import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConfigDto {
  @ApiProperty({ description: 'Unique key for the config entry' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Value for the config entry' })
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
