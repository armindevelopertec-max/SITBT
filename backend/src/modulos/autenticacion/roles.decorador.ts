import { SetMetadata } from '@nestjs/common';

/**
 * Clave con la que se guardan los roles requeridos en los metadatos
 * del controlador o del método.
 */
export const CLAVE_ROLES = 'roles';

/**
 * Indica qué roles pueden acceder a un controlador o a un método.
 *
 * Ejemplo:
 *   @Roles('administrador', 'secretaria')
 *   @UseGuards(GuardaJwt, GuardaRoles)
 *   @Controller('usuarios')
 */
export const Roles = (...roles: string[]) => SetMetadata(CLAVE_ROLES, roles);
