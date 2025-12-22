import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { GithubCommit } from './entities/github-commit.entity';
import GithubApiError from './types/github-api-error.interface';
import { LlmService } from 'src/core/llm/llm.service';
import { GithubRepository } from './entities/github-repository.entity';
import { DailyReportResponse } from 'src/core/llm/dto/daily-report.dto';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(
    @Inject('OCTOKIT_INSTANCE') private readonly octokit: Octokit,
    private readonly llmService: LlmService,
  ) { }

  async listUserRepos(): Promise<GithubRepository[]> {
    try {
      this.logger.log(`Fetching repositories for the authenticated user and their organizations`);

      
      const { data: userRepos } = await this.octokit.repos.listForAuthenticatedUser({
        type: 'owner',
        sort: 'updated',
        per_page: 100,
      });
      this.logger.log(`Successfully fetched ${userRepos.length} personal repositories`);

      
      const { data: orgs } = await this.octokit.orgs.listForAuthenticatedUser();
      this.logger.log(`User is a member of ${orgs.length} organizations`);

      
      const orgReposPromises = orgs.map(org =>
        this.octokit.repos.listForOrg({
          org: org.login,
          type: 'member',
          per_page: 100,
        }).then(response => {
          this.logger.log(`Fetched ${response.data.length} repos for org ${org.login}`);
          return response.data;
        })
      );

      const orgReposArrays = await Promise.all(orgReposPromises);
      const orgRepos = orgReposArrays.flat();

      
      const allRepos = [...userRepos, ...orgRepos];
      const uniqueRepos = Array.from(new Map(allRepos.map(repo => [repo.id, repo])).values());

      uniqueRepos.sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime());

      this.logger.log(`Total unique repositories fetched: ${uniqueRepos.length}`);

      return uniqueRepos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        default_branch: repo.default_branch ?? 'main',
        owner: {
          login: repo.owner.login,
          avatarUrl: repo.owner.avatar_url,
        },
      }));
    } catch (error) {
      const err = error as GithubApiError;
      this.logger.error(`Failed to fetch repositories`, err.stack);

      if (err.status === 403) {
        throw new ForbiddenException(
          'GitHub API rate limit exceeded or access forbidden',
        );
      }

      throw new InternalServerErrorException(
        `Failed to fetch repositories: ${err.message}`,
      );
    }
  }

  async listRepoBranches(owner: string, repo: string): Promise<string[]> {
    try {
      this.logger.log(`Fetching branches for ${owner}/${repo}`);

      const { data } = await this.octokit.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });

      this.logger.log(`Successfully fetched ${data.length} branches`);

      return data.map((branch) => branch.name);
    } catch (error) {
      const err = error as GithubApiError;
      this.logger.error(`Failed to fetch branches for ${owner}/${repo}`, err.stack);

      if (err.status === 404) {
        throw new NotFoundException(`Repository ${owner}/${repo} not found`);
      }

      throw new InternalServerErrorException(
        `Failed to fetch branches: ${err.message}`,
      );
    }
  }

  async fetchCommits(
    owner: string,
    repo: string,
    branch?: string,
    page?: number,
  ): Promise<GithubCommit[]> {
    try {
      const pageNumber = page || 1;
      this.logger.log(
        `Fetching commits for ${owner}/${repo}, page ${pageNumber}`,
      );

      const params: {
        owner: string;
        repo: string;
        sha?: string;
        per_page: number;
        page: number;
      } = {
        owner,
        repo,
        per_page: 30,
        page: pageNumber,
      };

      if (branch) {
        params.sha = branch;
        this.logger.log(`Filtering by branch: ${branch}`);
      }

      const { data } = await this.octokit.repos.listCommits(params);

      this.logger.log(
        `Successfully fetched ${data.length} commits for ${owner}/${repo}`,
      );

      return data.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author
          ? {
              name: commit.commit.author.name || '',
              email: commit.commit.author.email || '',
              date: commit.commit.author.date || '',
            }
          : null,
        url: commit.html_url,
      }));
    } catch (error) {
      const err = error as GithubApiError;
      this.logger.error(
        `Failed to fetch commits for ${owner}/${repo}`,
        err.stack,
      );

      if (err.status === 404) {
        throw new NotFoundException(`Repository ${owner}/${repo} not found`);
      }

      if (err.status === 403) {
        throw new ForbiddenException(
          'GitHub API rate limit exceeded or access forbidden',
        );
      }

      if (err.status >= 500) {
        throw new InternalServerErrorException(
          'GitHub API returned a server error',
        );
      }

      throw new InternalServerErrorException(
        `Failed to fetch commits: ${err.message}`,
      );
    }
  }

  async generateCommitReport(commits: GithubCommit[]): Promise<DailyReportResponse> {
    this.logger.log(`Generating report for ${commits.length} commits.`);

    
    const enrichedCommits = await this.enrichCommitsWithDetails(commits.slice(0, 50));

    const formattedCommits = enrichedCommits
      .map((commit) => {
        const lines: string[] = [];
        lines.push(`## Commit: ${commit.sha.substring(0, 7)}`);
        lines.push(`**Message:** ${commit.message}`);

        if (commit.author) {
          lines.push(`**Author:** ${commit.author.name} (${commit.author.date})`);
        }

        if (commit.stats) {
          lines.push(`**Stats:** +${commit.stats.additions} -${commit.stats.deletions} (${commit.stats.total} changes)`);
        }

        if (commit.files && commit.files.length > 0) {
          lines.push(`**Files changed (${commit.files.length}):**`);
          for (const file of commit.files) {
            lines.push(`\n### File: ${file.filename} [${file.status}] (+${file.additions}/-${file.deletions})`);
            if (file.patch) {
              lines.push('```diff');
              lines.push(file.patch);
              lines.push('```');
            }
          }
        }

        return lines.join('\n');
      })
      .join('\n\n---\n\n');

    return this.llmService.generateReport(formattedCommits);
  }

  private async enrichCommitsWithDetails(commits: GithubCommit[]): Promise<GithubCommit[]> {
    
    
    if (commits.length === 0) return commits;

    const urlParts = commits[0].url.split('/');
    const owner = urlParts[3];
    const repo = urlParts[4];

    this.logger.log(`Enriching ${commits.length} commits with file details for ${owner}/${repo}`);

    const enrichedCommits: GithubCommit[] = [];

    for (const commit of commits) {
      try {
        const { data } = await this.octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });

        enrichedCommits.push({
          ...commit,
          stats: data.stats ? {
            additions: data.stats.additions || 0,
            deletions: data.stats.deletions || 0,
            total: data.stats.total || 0,
          } : undefined,
          files: data.files?.map((file) => ({
            filename: file.filename || '',
            status: file.status || 'modified',
            additions: file.additions || 0,
            deletions: file.deletions || 0,
            changes: file.changes || 0,
            patch: file.patch, 
          })),
        });
      } catch (error) {
        this.logger.warn(`Failed to fetch details for commit ${commit.sha}, using basic info`);
        enrichedCommits.push(commit);
      }
    }

    this.logger.log(`Successfully enriched ${enrichedCommits.length} commits`);
    return enrichedCommits;
  }
}