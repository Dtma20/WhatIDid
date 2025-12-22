import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LlmService } from '../../core/llm/llm.service';
import { GeminiAdapter } from './gemini.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    GeminiAdapter,
    {
      provide: LlmService,
      useFactory: (config: ConfigService, gemini: GeminiAdapter) => {
        const provider = config.get<string>('llm.provider');

        if (provider === 'gemini') {
          return gemini;
        }

        throw new Error(`LLM provider ${provider} not supported.`);
      },
      inject: [ConfigService, GeminiAdapter],
    },
  ],
  exports: [LlmService],
})
export class LlmFactory {}