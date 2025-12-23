import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../services/user.service';

@Injectable()
export class GithubPublicStrategy extends PassportStrategy(Strategy, 'github-public') {
    private readonly logger = new Logger(GithubPublicStrategy.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            clientID: configService.getOrThrow<string>('auth.github.clientId'),
            clientSecret: configService.getOrThrow<string>('auth.github.clientSecret'),
            callbackURL: configService.getOrThrow<string>('auth.github.callbackUrl') + '?scope=public',
            scope: ['user:email', 'public_repo'],
        });
    }

    async validate(
        accessToken: string,
        _refreshToken: string,
        profile: Profile,
    ): Promise<any> {
        this.logger.log(`GitHub OAuth callback (public only) for user: ${profile.username}`);

        if (!profile.id || !profile.username) {
            this.logger.warn('Invalid GitHub profile: missing id or username');
            throw new UnauthorizedException('Invalid GitHub profile');
        }

        const email = profile.emails?.[0]?.value || null;
        const avatar = profile.photos?.[0]?.value || null;

        const user = await this.userService.findOrCreate(
            {
                id: parseInt(profile.id, 10),
                username: profile.username,
                email,
                avatar,
            },
            accessToken,
        );

        this.logger.log(`User authenticated (public only): ${user.username} (ID: ${user.id})`);
        return user;
    }
}
