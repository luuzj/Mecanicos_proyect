import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Rol, SesionUsuario, RegistroRequest } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
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

type CampoRegistro = 'nombre' | 'correo' | 'telefono' | 'contrasena' | 'confirmarContrasena';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, IconoOjo, Logo, SoloNumeros],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly mostrarContrasena = signal(false);
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly sesion = signal<SesionUsuario | null>(null);

  protected readonly formulario = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.pattern(PATRON_NOMBRE)]],
      correo: ['', [Validators.required, Validators.pattern(PATRON_CORREO)]],
      telefono: ['', [Validators.required, Validators.pattern(PATRON_TELEFONO)]],
      contrasena: ['', [Validators.required, Validators.pattern(PATRON_CONTRASENA)]],
      confirmarContrasena: ['', Validators.required],
      rol: ['usuario' as Rol, Validators.required],
    },
    { validators: contrasenasCoinciden('contrasena', 'confirmarContrasena') }
  );

  protected get esMecanico(): boolean {
    return this.formulario.controls.rol.value === 'mecanico';
  }

  /** Muestra el error de un campo solo si ya se toco */
  protected mostrarError(campo: CampoRegistro): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected get noCoinciden(): boolean {
    return (
      this.formulario.hasError('noCoinciden') &&
      this.formulario.controls.confirmarContrasena.touched
    );
  }

  protected seleccionarRol(rol: Rol): void {
    this.formulario.controls.rol.setValue(rol);
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

    // Mapeo adaptado al DTO de NestJS (RegisterDto)
    const payload: RegistroRequest = {
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim().toLowerCase(),
      telefono: datos.telefono,
      password: datos.contrasena,
      role: datos.rol === 'mecanico' ? 'mecanico' : 'cliente',
    };

    this.auth.registrar(payload).subscribe({
      next: (sesion) => {
        this.enviando.set(false);
        this.sesion.set(sesion);
      },
      error: (error: Error) => {
        this.enviando.set(false);
        this.errorServidor.set(error.message);
      },
    });
  }
}