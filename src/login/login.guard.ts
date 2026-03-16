import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
