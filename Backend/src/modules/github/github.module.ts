import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { GithubService } from './github.service';
import { LlmModule } from '../llm/llm.module';
import { GithubController } from './github.controller';

@Module({
  imports: [ConfigModule, LlmModule],
  controllers: [GithubController],
  providers: [
    GithubService,
    {
      provide: 'OCTOKIT_INSTANCE',
      useFactory: (configService: ConfigService) => {
        return new Octokit({
          auth: configService.get<string>('github.token'),
          request: {
            timeout: 10000,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [GithubService],
})
export class GithubModule {}