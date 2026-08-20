// src/app/core/services/auth.service.ts

import { Injectable, inject } from '@angular/core'; // <--- inject viene de @angular/core
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Credenciales, RegistroRequest, SesionUsuario } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/auth';

  registrar(datos: RegistroRequest): Observable<SesionUsuario> {
    return this.http.post<SesionUsuario>(`${this.apiUrl}/register`, datos);
  }

  iniciarSesion(credenciales: Credenciales): Observable<SesionUsuario> {
    return this.http.post<SesionUsuario>(`${this.apiUrl}/login`, credenciales);
  }

  cerrarSesion(): void {
    // Limpia local storage o tokens cuando lo requieras
    localStorage.clear();
  }
}