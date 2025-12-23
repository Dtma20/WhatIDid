import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserPayload } from './entities/user.entity';
import { UserService } from './services/user.service';

export interface AuthResult {
    accessToken: string;
    user: {
        id: string;
        username: string;
        avatar: string | null;
    };
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) { }

    async login(user: User): Promise<AuthResult> {
        const payload: UserPayload = {
            sub: user.id,
            username: user.username,
            githubId: user.githubId,
        };

        const accessToken = this.jwtService.sign(payload);

        this.logger.log(`JWT generated for user: ${user.username} (ID: ${user.id})`);

        return {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
            },
        };
    }

    async validateUser(userId: string): Promise<User | null> {
        return this.userService.findById(userId);
    }

    getDecryptedGithubToken(user: User): string {
        return this.userService.getDecryptedAccessToken(user);
    }
}
