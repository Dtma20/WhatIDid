export interface SavedReport {
    id: string;
    repositoryName: string;
    generatedAt: string;
    summary: string;
    isFavorite?: boolean;
}

export interface SavedReportDetail extends SavedReport {
    content: {
        meta: {
            date_context: string;
            primary_language: string;
            effort_level: string;
        };
        summary: {
            title: string;
            executive_overview: string;
            technical_highlights: string[];
        };
        groups: Array<{
            category: string;
            icon: string;
            items: Array<{
                description: string;
                impact: string;
                original_commits_count: number;
            }>;
        }>;
    };
}

export interface GroupedReports {
    today: SavedReport[];
    yesterday: SavedReport[];
    lastWeek: SavedReport[];
    older: SavedReport[];
}

export function groupReportsByDate(reports: SavedReport[]): GroupedReports {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const grouped: GroupedReports = {
        today: [],
        yesterday: [],
        lastWeek: [],
        older: [],
    };

    for (const report of reports) {
        const reportDate = new Date(report.generatedAt);
        const reportDay = new Date(
            reportDate.getFullYear(),
            reportDate.getMonth(),
            reportDate.getDate()
        );

        if (reportDay.getTime() === today.getTime()) {
            grouped.today.push(report);
        } else if (reportDay.getTime() === yesterday.getTime()) {
            grouped.yesterday.push(report);
        } else if (reportDay >= lastWeek) {
            grouped.lastWeek.push(report);
        } else {
            grouped.older.push(report);
        }
    }

    return grouped;
}
