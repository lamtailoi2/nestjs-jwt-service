import { ExecutionContext } from '@nestjs/common';
import { TokenService } from 'src/users/token.service';
export class AuthGuard {
  constructor(private tokenService: TokenService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return false;
    }
    return true;
  }
}
