import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { SesionService } from '../../core/services/sesion.service';
import { PATRON_CORREO } from '../../core/validadores/validadores';
import { IconoOjo } from '../../shared/icono-ojo/icono-ojo';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, IconoOjo, Logo],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  protected readonly mostrarContrasena = signal(false);
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.pattern(PATRON_CORREO)]],
    password: ['', Validators.required],
  });

  protected mostrarError(campo: 'correo' | 'password'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected alternarContrasena(): void {
    this.mostrarContrasena.update((valor) => !valor);
  }

  protected iniciarSesion(): void {
    this.errorServidor.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const datos = this.formulario.getRawValue();

    this.auth
      .iniciarSesion({
        correo: datos.correo.trim().toLowerCase(),
        password: datos.password,
      })
      .subscribe({
        next: (respuesta) => {
          this.enviando.set(false);
          const ruta = this.sesion.rutaSegunRol(respuesta.user.role);
          void this.router.navigate([ruta]);
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          this.errorServidor.set(this.mensajeDeError(error));
        },
      });
  }

  private mensajeDeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    const http = error as { status?: number; error?: { message?: string | string[] } };

    if (http.status === 401) {
      return 'El correo o la contraseña no son correctos';
    }
    if (http.status === 0) {
      return 'No pudimos conectar con el servidor. Revisa tu conexión.';
    }

    const mensaje = http.error?.message;
    if (Array.isArray(mensaje)) {
      return mensaje[0];
    }
    return mensaje ?? 'Algo salió mal, intenta de nuevo';
  }
}