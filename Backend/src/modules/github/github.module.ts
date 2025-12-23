import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GithubService } from './github.service';
import { LlmModule } from '../llm/llm.module';
import { GithubController } from './github.controller';
import { AuthModule } from '../auth/auth.module';
import { ReportModule } from '../report/report.module';

@Module({
  imports: [ConfigModule, LlmModule, AuthModule, ReportModule],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule { }