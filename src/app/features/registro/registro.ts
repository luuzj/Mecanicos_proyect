import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Rol } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
import { SesionService } from '../../core/services/sesion.service';
import {
  PATRON_CONTRASENA,
  PATRON_CORREO,
  PATRON_NOMBRE,
  PATRON_TELEFONO,
  contrasenasCoinciden,
} from '../../core/validadores/validadores';
import { SoloNumeros } from '../../shared/directivas/solo-numeros';
import { IconoOjo } from '../../shared/icono-ojo/icono-ojo';
import { Logo } from '../../shared/logo/logo';

type CampoRegistro = 'nombre' | 'correo' | 'telefono' | 'password' | 'confirmarPassword';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, IconoOjo, Logo, SoloNumeros],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  protected readonly mostrarContrasena = signal(false);
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.pattern(PATRON_NOMBRE)]],
      correo: ['', [Validators.required, Validators.pattern(PATRON_CORREO)]],
      telefono: ['', [Validators.required, Validators.pattern(PATRON_TELEFONO)]],
      password: ['', [Validators.required, Validators.pattern(PATRON_CONTRASENA)]],
      confirmarPassword: ['', Validators.required],
      role: ['cliente' as Rol, Validators.required],
    },
    { validators: contrasenasCoinciden('password', 'confirmarPassword') }
  );

  protected get esMecanico(): boolean {
    return this.formulario.controls.role.value === 'mecanico';
  }

  protected mostrarError(campo: CampoRegistro): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected get noCoinciden(): boolean {
    return (
      this.formulario.hasError('noCoinciden') &&
      this.formulario.controls.confirmarPassword.touched
    );
  }

  protected seleccionarRol(role: Rol): void {
    this.formulario.controls.role.setValue(role);
  }

  protected alternarContrasena(): void {
    this.mostrarContrasena.update((valor) => !valor);
  }

  protected registrar(): void {
    this.errorServidor.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const datos = this.formulario.getRawValue();

    
    this.auth
      .registrar({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim().toLowerCase(),
        telefono: datos.telefono.trim(),
        password: datos.password,
        role: datos.role,
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

    if (http.status === 409) {
      return 'Ya existe una cuenta con ese correo o teléfono';
    }
    if (http.status === 0) {
      return 'No pudimos conectar con el servidor. Revisa tu conexión.';
    }

    const mensaje = http.error?.message;
    if (Array.isArray(mensaje)) {
      return mensaje[0];
    }
    return mensaje ?? 'Ocurrió un error al intentar registrarte';
  }
}