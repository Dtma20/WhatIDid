import { Module } from '@nestjs/common';
import { LlmFactory } from 'src/infra/llm/llm.factory';

@Module({
  imports: [LlmFactory],
  exports: [LlmFactory],
})
export class LlmModule {}