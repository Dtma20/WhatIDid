import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../database';
import type { ExtendedPrismaClient } from '../../database';

@Injectable()
export class ReportService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: ExtendedPrismaClient,
    ) { }

    async create(userId: string, content: object, repositoryName: string) {
        return this.prisma.report.create({
            data: {
                userId,
                content,
                repositoryName,
            },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.report.findMany({
            where: { userId },
            orderBy: { generatedAt: 'desc' },
        });
    }

    async findById(id: string) {
        return this.prisma.report.findUnique({
            where: { id },
        });
    }

    async findByIdForUser(id: string, userId: string) {
        return this.prisma.report.findFirst({
            where: { id, userId },
        });
    }

    async deleteByIdForUser(id: string, userId: string) {
        const report = await this.findByIdForUser(id, userId);
        if (!report) {
            return null;
        }
        return this.prisma.report.delete({
            where: { id },
        });
    }

    async findHighQualityReports(minScore: number) {
        return this.prisma.$queryRaw`
      SELECT id, repository_name, content->>'qualityScore' as score
      FROM "Report"
      WHERE (content->>'qualityScore')::int >= ${minScore}
      ORDER BY (content->>'qualityScore')::int DESC
    `;
    }
}
