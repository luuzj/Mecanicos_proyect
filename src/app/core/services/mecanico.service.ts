import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  DatosPerfilMecanico,
  EstadoMecanico,
  PerfilMecanico,
} from '../models/mecanico.model';

@Injectable({ providedIn: 'root' })
export class MecanicoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/mechanics`;

  readonly perfil = signal<PerfilMecanico | null>(null);

  cargarPerfil(): Observable<PerfilMecanico | null> {
    return this.http
      .get<PerfilMecanico | null>(`${this.base}/me`)
      .pipe(tap((p) => this.perfil.set(p)));
  }

  crearPerfil(datos: DatosPerfilMecanico): Observable<PerfilMecanico> {
    return this.http
      .post<PerfilMecanico>(this.base, datos)
      .pipe(tap((p) => this.perfil.set(p)));
  }

  actualizarPerfil(datos: Partial<DatosPerfilMecanico>): Observable<PerfilMecanico> {
    return this.http
      .patch<PerfilMecanico>(`${this.base}/me`, datos)
      .pipe(tap((p) => this.perfil.set(p)));
  }

  cambiarEstado(estado: EstadoMecanico): Observable<PerfilMecanico> {
    return this.actualizarPerfil({ estado });
  }

  listarDisponibles(): Observable<PerfilMecanico[]> {
    return this.http.get<PerfilMecanico[]>(`${this.base}/disponibles`);
  }

  perfilCompleto(perfil: Partial<DatosPerfilMecanico> | null): boolean {
    if (!perfil) return false;
    return (
      !!perfil.nombreTaller?.trim() &&
      !!perfil.telefono?.trim() &&
      !!perfil.direccion?.trim() &&
      typeof perfil.latitud === 'number' &&
      typeof perfil.longitud === 'number'
    );
  }
}