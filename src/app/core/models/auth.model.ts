/**
 * Modelos de autenticación.
 * Estructuras alineadas con las respuestas y DTOs del backend en NestJS.
 */

export type Rol = 'usuario' | 'mecanico';
export type RolBackend = 'mecanico' | 'cliente';

/** Lo que se manda a POST /auth/login */
export interface Credenciales {
  correo: string;
  password: string; // En NestJS el campo se llama 'password'
}

/**
 * Lo que se manda a POST /auth/registro.
 */
export interface RegistroRequest {
  nombre: string;
  correo: string;
  telefono: string;
  password: string; // En NestJS el campo se llama 'password'
  role: RolBackend; // En NestJS el campo se llama 'role' y usa mayúsculas
}

/** Firma de los tokens devueltos por NestJS */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Entidad de usuario devuelta por el backend */
export interface UsuarioBackend {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  role: RolBackend;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Lo que el backend devuelve al iniciar sesión o registrarse */
export interface SesionUsuario {
  user: UsuarioBackend;
  tokens: AuthTokens;
}