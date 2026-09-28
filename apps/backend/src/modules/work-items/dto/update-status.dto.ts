import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkItemStatus } from '../enums/work-item-status.enum';

export class UpdateStatusDto {
  @IsEnum(WorkItemStatus)
  status!: WorkItemStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
