import { IsString, MinLength } from 'class-validator';

export class AssignUnitDto {
  @IsString()
  @MinLength(1)
  unit!: string;
}
