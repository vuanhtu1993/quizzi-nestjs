import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class TimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // return next.handle();
    // SHOW HOW LONG TAKE THE REQUEST
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const end = Date.now();
        console.log(`Request took ${end - start}ms`);
      })
    );
  }
}
