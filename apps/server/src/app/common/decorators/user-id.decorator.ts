import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom parameter decorator to extract user ID from the x-user-id header.
 *
 * For modifying requests (POST, PUT, PATCH, DELETE), the header is required.
 * For read-only requests (GET, HEAD, OPTIONS), it's optional.
 *
 * @example
 * ```typescript
 * @Post()
 * async create(@Body() data: MyDto, @UserId() userId: string) {
 *   return this.service.create(data, userId);
 * }
 * ```
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const userId = request.headers['x-user-id'] as string | undefined;

    const modifyingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (modifyingMethods.includes(request.method)) {
      if (!userId || userId.trim() === '') {
        throw new BadRequestException('x-user-id header is required for modifying requests');
      }
      return userId.trim();
    }

    return userId?.trim() || '';
  },
);
