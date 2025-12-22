import { DailyReportResponse } from './dto/daily-report.dto';

export abstract class LlmService {
  abstract generateReport(commits: string): Promise<DailyReportResponse>;
}