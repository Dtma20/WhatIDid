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

@Controller('github')
export class GithubController {
  private readonly logger = new Logger(GithubController.name);

  constructor(private readonly githubService: GithubService) {}

  @Get('repositories')
  async listRepositories() {
    this.logger.log(`Received request to list repositories`);
    return this.githubService.listUserRepos();
  }

  @Get(':owner/:repo/branches')
  async listRepoBranches(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    this.logger.log(`Received request to list branches for ${owner}/${repo}`);
    return this.githubService.listRepoBranches(owner, repo);
  }

  @Get('commits')
  async listCommits(@Query() query: ListCommitsDto) {
    const { owner, repo, branch, page } = query;
    this.logger.log(
      `Received request to list commits for ${owner}/${repo} on page ${
        page || 1
      }`,
    );
    return this.githubService.fetchCommits(owner, repo, branch, page);
  }

  @Post('report')
  async generateReport(
    @Body() reportDto: GenerateCustomReportDto,
  ): Promise<DailyReportResponse> {
    this.logger.log(
      `Received request to generate report for ${reportDto.commits.length} commits.`,
    );
    return this.githubService.generateCommitReport(reportDto.commits);
  }
}
