import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Credenciales,
  DatosRegistro,
  RespuestaAuth,
  Usuario,
} from '../models/auth.model';
import { SesionService } from './sesion.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SesionService);
  private readonly base = `${environment.apiUrl}/auth`;

  registrar(datos: DatosRegistro): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.base}/register`, datos)
      .pipe(tap((r) => this.sesion.guardar(r.user, r.tokens)));
  }

  iniciarSesion(credenciales: Credenciales): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.base}/login`, credenciales)
      .pipe(tap((r) => this.sesion.guardar(r.user, r.tokens)));
  }

  cerrarSesion(): void {
    this.sesion.limpiar();
  }

  actualizarDatos(cambios: { telefono: string }): Observable<Usuario> {
    return this.http
      .patch<Usuario>(`${this.base}/me`, cambios)
      .pipe(tap((u) => this.sesion.actualizarUsuario(u)));
  }

  eliminarCuenta(): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/me`)
      .pipe(tap(() => this.sesion.limpiar()));
  }

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/me`);
  }
}