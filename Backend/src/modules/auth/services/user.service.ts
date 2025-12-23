import { Injectable, Inject, Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { PRISMA_CLIENT } from '../../../database';
import type { ExtendedPrismaClient } from '../../../database';

interface GitHubProfile {
    id: number;
    username: string;
    email: string | null;
    avatar: string | null;
}

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: ExtendedPrismaClient,
    ) { }

    async findByGithubId(githubId: number): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { githubId: String(githubId) },
        });

        if (!user) return null;

        return this.mapToUser(user);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return this.mapToUser(user);
    }

    async findOrCreate(profile: GitHubProfile, accessToken: string): Promise<User> {
        const user = await this.prisma.user.upsert({
            where: { githubId: String(profile.id) },
            update: {
                username: profile.username,
                avatarUrl: profile.avatar,
                encryptedAccessToken: accessToken,
            },
            create: {
                githubId: String(profile.id),
                username: profile.username,
                avatarUrl: profile.avatar,
                encryptedAccessToken: accessToken,
            },
        });

        this.logger.log(`User upserted: ${profile.username} (GitHub ID: ${profile.id})`);

        return this.mapToUser(user);
    }

    async updateAccessToken(userId: string, accessToken: string): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { encryptedAccessToken: accessToken },
        });

        return this.mapToUser(user);
    }

    getDecryptedAccessToken(user: User): string {
        return user.encryptedAccessToken;
    }

    private mapToUser(dbUser: {
        id: string;
        githubId: string;
        username: string;
        avatarUrl: string | null;
        encryptedAccessToken: string;
        createdAt: Date;
        updatedAt: Date;
    }): User {
        return {
            id: dbUser.id,
            githubId: parseInt(dbUser.githubId, 10),
            username: dbUser.username,
            email: null,
            avatar: dbUser.avatarUrl,
            encryptedAccessToken: dbUser.encryptedAccessToken,
            createdAt: dbUser.createdAt,
            updatedAt: dbUser.updatedAt,
        };
    }
}
