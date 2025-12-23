import {
    Controller,
    Get,
    Param,
    UseGuards,
    NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReportService } from './report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Get()
    async getMyReports(@CurrentUser() user: { sub: string }) {
        const reports = await this.reportService.findByUser(user.sub);
        return {
            data: reports.map((report) => ({
                id: report.id,
                repositoryName: report.repositoryName,
                generatedAt: report.generatedAt,
                summary: this.extractSummary(report.content),
            })),
            total: reports.length,
        };
    }

    @Get(':id')
    async getReportById(
        @CurrentUser() user: { sub: string },
        @Param('id') id: string,
    ) {
        const report = await this.reportService.findByIdForUser(id, user.sub);

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        return {
            id: report.id,
            repositoryName: report.repositoryName,
            content: report.content,
            generatedAt: report.generatedAt,
        };
    }

    private extractSummary(content: unknown): string {
        if (typeof content === 'object' && content !== null) {
            const c = content as Record<string, unknown>;

            // If the LLM returned a structured summary object, prefer summary.title
            if (c.summary && typeof c.summary === 'object') {
                const s = c.summary as Record<string, unknown>;
                if (typeof s.title === 'string' && s.title.trim().length > 0) {
                    return s.title;
                }
            }

            // Backwards-compatible cases: summary as string or top-level title
            if (typeof c.summary === 'string' && c.summary.trim().length > 0) {
                return c.summary;
            }
            if (typeof c.title === 'string' && c.title.trim().length > 0) {
                return c.title;
            }
        }

        return 'Report generated';
    }
}
