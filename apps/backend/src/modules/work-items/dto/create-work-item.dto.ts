import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWorkItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  externalId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
