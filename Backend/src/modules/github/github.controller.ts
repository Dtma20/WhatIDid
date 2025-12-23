import {
  Controller,
  Get,
  Body,
  Post,
  Logger,
  Query,
  Param,
} from '@nestjs/common';
import { GithubService } from './github.service';
import { ListCommitsDto } from './dto/list-commits.dto';
import { DailyReportResponse } from 'src/core/llm/dto/daily-report.dto';
import { GenerateCustomReportDto } from './dto/generate-custom-report.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '../auth/entities/user.entity';

@Controller('github')
export class GithubController {
  private readonly logger = new Logger(GithubController.name);

  constructor(private readonly githubService: GithubService) { }

  @Get('repositories')
  async listRepositories(@CurrentUser() user: User) {
    this.logger.log(`Received request to list repositories for user: ${user.username}`);
    return this.githubService.listUserRepos(user);
  }

  @Get(':owner/:repo/branches')
  async listRepoBranches(
    @CurrentUser() user: User,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    this.logger.log(`Received request to list branches for ${owner}/${repo}`);
    return this.githubService.listRepoBranches(user, owner, repo);
  }

  @Get('commits')
  async listCommits(
    @CurrentUser() user: User,
    @Query() query: ListCommitsDto,
  ) {
    const { owner, repo, branch, page } = query;
    this.logger.log(
      `Received request to list commits for ${owner}/${repo} on page ${page || 1
      }`,
    );
    return this.githubService.fetchCommits(user, owner, repo, branch, page);
  }

  @Post('report')
  async generateReport(
    @CurrentUser() user: User,
    @Body() reportDto: GenerateCustomReportDto,
  ): Promise<DailyReportResponse> {
    this.logger.log(
      `Received request to generate report for ${reportDto.commits.length} commits.`,
    );
    return this.githubService.generateCommitReport(user, reportDto.commits);
  }
}
