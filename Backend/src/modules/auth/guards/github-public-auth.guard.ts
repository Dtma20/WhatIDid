import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GithubPublicAuthGuard extends AuthGuard('github-public') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }
}
