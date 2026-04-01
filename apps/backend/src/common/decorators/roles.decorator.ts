import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator that sets required roles on a route handler or controller.
 * Used together with RolesGuard to restrict access.
 *
 * @example
 * ```ts
 * @Roles('admin')
 * @Get('protected')
 * getProtected() { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
