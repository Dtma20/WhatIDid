import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GithubPublicAuthGuard } from './guards/github-public-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Public()
    @Get('github')
    @UseGuards(GithubAuthGuard)
    async githubLogin() {
        this.logger.log('Initiating GitHub OAuth login (full access)');
    }

    @Public()
    @Get('github/public')
    @UseGuards(GithubPublicAuthGuard)
    async githubLoginPublic() {
        this.logger.log('Initiating GitHub OAuth login (public only)');
    }

    @Public()
    @Get('github/callback')
    @UseGuards(GithubAuthGuard)
    async githubCallback(@Req() req: any, @Res() res: Response) {
        return this.handleCallback(req, res);
    }

    private async handleCallback(req: any, res: Response) {
        this.logger.log(`GitHub callback received for user: ${req.user?.username}`);

        const result = await this.authService.login(req.user);

        const frontendUrl = this.configService.get<string>(
            'auth.frontendUrl',
            'http://localhost:5173',
        );

        const redirectUrl = new URL('/auth/callback', frontendUrl);
        redirectUrl.searchParams.set('token', result.accessToken);

        return res.redirect(redirectUrl.toString());
    }

    @Get('me')
    async getMe(@CurrentUser() user: User) {
        return {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            email: user.email,
        };
    }

    @Get('logout')
    async logout(@Res() res: Response) {
        const frontendUrl = this.configService.get<string>(
            'auth.frontendUrl',
            'http://localhost:5173',
        );

        return res.redirect(frontendUrl);
    }
}
