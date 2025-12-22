export class DailyReportResponse {
  meta!: {
    date_context: string;
    primary_language: string;
    effort_level: 'Low' | 'Medium' | 'High';
  };
  summary!: {
    title: string;
    executive_overview: string;
    technical_highlights: string[];
  };
  groups!: Array<{
    category: 'Features' | 'Fixes' | 'Refactor' | 'Chore' | 'Docs';
    icon: string;
    items: Array<{
      description: string;
      impact: 'Critical' | 'Major' | 'Minor';
      original_commits_count: number;
    }>;
  }>;
}
