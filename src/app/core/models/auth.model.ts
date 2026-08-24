
export type Rol = 'cliente' | 'mecanico';

export interface Credenciales {
  correo: string;
  password: string;
}


export interface DatosRegistro {
  nombre: string;
  correo: string;
  telefono: string;
  password: string;
  role: Rol;
}


export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  role: Rol;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}


export interface RespuestaAuth {
  user: Usuario;
  tokens: Tokens;
}
