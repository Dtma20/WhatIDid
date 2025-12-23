import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { EncryptionService } from './encryption.service';
import { randomUUID } from 'crypto';

interface GitHubProfile {
    id: number;
    username: string;
    email: string | null;
    avatar: string | null;
}

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    // In-memory store - replace with a real database in production
    private readonly users = new Map<string, User>();
    private readonly githubIdIndex = new Map<number, string>();

    constructor(private readonly encryptionService: EncryptionService) { }

    async findByGithubId(githubId: number): Promise<User | null> {
        const userId = this.githubIdIndex.get(githubId);
        if (!userId) {
            return null;
        }
        return this.users.get(userId) || null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async findOrCreate(profile: GitHubProfile, accessToken: string): Promise<User> {
        const existingUser = await this.findByGithubId(profile.id);

        if (existingUser) {
            this.logger.log(`User found: ${profile.username} (GitHub ID: ${profile.id})`);
            // Update the access token
            const updatedUser = await this.updateAccessToken(existingUser.id, accessToken);
            return updatedUser;
        }

        // Create new user
        const encryptedToken = this.encryptionService.encrypt(accessToken);
        const now = new Date();

        const newUser: User = {
            id: randomUUID(),
            githubId: profile.id,
            username: profile.username,
            email: profile.email,
            avatar: profile.avatar,
            encryptedAccessToken: encryptedToken,
            createdAt: now,
            updatedAt: now,
        };

        this.users.set(newUser.id, newUser);
        this.githubIdIndex.set(profile.id, newUser.id);

        this.logger.log(`New user created: ${profile.username} (GitHub ID: ${profile.id})`);
        return newUser;
    }

    async updateAccessToken(userId: string, accessToken: string): Promise<User> {
        const user = await this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const encryptedToken = this.encryptionService.encrypt(accessToken);
        const updatedUser: User = {
            ...user,
            encryptedAccessToken: encryptedToken,
            updatedAt: new Date(),
        };

        this.users.set(userId, updatedUser);
        return updatedUser;
    }

    getDecryptedAccessToken(user: User): string {
        return this.encryptionService.decrypt(user.encryptedAccessToken);
    }
}
