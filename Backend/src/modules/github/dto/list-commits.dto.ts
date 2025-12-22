import { IsString, IsOptional, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCommitsDto {
  @IsString()
  @IsNotEmpty()
  owner!: string;

  @IsString()
  @IsNotEmpty()
  repo!: string;

  @IsString()
  @IsOptional()
  branch?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;
}
