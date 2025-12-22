import { Type } from 'class-transformer';
import {
  IsString,
  IsUrl,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsArray,
} from 'class-validator';

export class GithubCommitAuthor {
  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  date!: string;
}

export class GithubCommitFile {
  @IsString()
  filename!: string;

  @IsString()
  status!: string;

  @IsNumber()
  additions!: number;

  @IsNumber()
  deletions!: number;

  @IsNumber()
  changes!: number;

  @IsOptional()
  @IsString()
  patch?: string;
}

export class GithubCommitStats {
  @IsNumber()
  additions!: number;

  @IsNumber()
  deletions!: number;

  @IsNumber()
  total!: number;
}

export class GithubCommit {
  @IsString()
  sha!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GithubCommitAuthor)
  author!: GithubCommitAuthor | null;

  @IsUrl()
  url!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GithubCommitStats)
  stats?: GithubCommitStats;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GithubCommitFile)
  files?: GithubCommitFile[];
}