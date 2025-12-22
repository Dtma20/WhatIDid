import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { LlmService } from 'src/core/llm/llm.service';
import { DailyReportResponse } from 'src/core/llm/dto/daily-report.dto';

@Injectable()
export class GeminiAdapter implements LlmService {
  private readonly logger = new Logger(GeminiAdapter.name);
  private readonly model: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('gemini.apiKey');
    const modelName = this.configService.get<string>(
      'gemini.model',
      'gemini-2.5-flash-lite',
    );

    const genAI = new GoogleGenerativeAI(apiKey);

    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
  }

  async generateReport(commits: string): Promise<DailyReportResponse> {
    try {
      const prompt = this.buildPrompt(commits);

      this.logger.log(
        `Generating JSON report for payload size: ${commits.length}...`,
      );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      return JSON.parse(textResponse);
    } catch (error) {
      this.logger.error('Failed to generate or parse structured report', error);
      throw new InternalServerErrorException('Error processing AI report');
    }
  }

  private buildPrompt(commitsList: string): string {
    return `
      You are a Technical Lead and Senior Code Reviewer.
      Your task is to analyze a raw git commit history and produce a structured JSON report in Portuguese (PT-BR).

      ### INPUT DATA:
      ${commitsList}

      ### INSTRUCTIONS:
      1. **Deduplication**: If multiple commits refer to the same logical task (e.g., "fix button", "fix button again", "button styling"), merge them into a single coherent entry.
      2. **Translation**: Output all descriptions in professional Portuguese (PT-BR). Keep technical terms (e.g., "Deploy", "Request", "Middleware") in English if they are standard.
      3. **Analysis**: Infer the 'effort_level' based on the complexity and number of changes.
      4. **Impact**: Identify if a change is 'Critical' (breaks/fixes logic), 'Major' (new feature), or 'Minor' (typo/style).

      ### OUTPUT SCHEMA (Strict JSON):
      You must follow this exact TypeScript interface structure:

      {
        "meta": {
          "date_context": "YYYY-MM-DD (today)",
          "primary_language": "Detected language (e.g., TypeScript, Python)",
          "effort_level": "Low" | "Medium" | "High"
        },
        "summary": {
          "title": "A catchy, short title for the day's work (e.g., 'Refatoração do Módulo de Auth')",
          "executive_overview": "A 2-3 sentence paragraph summarizing the business value delivered.",
          "technical_highlights": ["List of major technical decisions or libraries added"]
        },
        "groups": [
          {
            "category": "Features" | "Fixes" | "Refactor" | "Chore" | "Docs",
            "icon": "Emoji representing the category",
            "items": [
              {
                "description": "Clean, professional description of the task",
                "impact": "Critical" | "Major" | "Minor",
                "original_commits_count": Number (count of raw commits condensed into this item)
              }
            ]
          }
        ]
      }
    `;
  }
}