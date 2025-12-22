import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { GithubCommit } from '../entities/github-commit.entity';

export class GenerateCustomReportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GithubCommit)
  commits!: GithubCommit[];
}
