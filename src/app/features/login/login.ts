import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SesionUsuario } from '../../core/models/auth.model';
import { AuthService } from '../../core/services/auth.service';
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

  protected readonly mostrarContrasena = signal(false);
  protected readonly enviando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly sesion = signal<SesionUsuario | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.pattern(PATRON_CORREO)]],
    contrasena: ['', Validators.required],
  });

  /** Muestra el error de un campo solo si el usuario ya lo toco */
  protected mostrarError(campo: 'correo' | 'contrasena'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected alternarContrasena(): void {
    this.mostrarContrasena.update((valor) => !valor);
  }

  protected iniciarSesion(): void {
    this.errorServidor.set(null);

    if (this.formulario.invalid) {
      // Marca todo como tocado para que se vean los mensajes de una vez
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const datos = this.formulario.getRawValue();

    this.auth
      .iniciarSesion({
        correo: datos.correo.trim().toLowerCase(),
        password: datos.contrasena, // Mapeo a 'password' para NestJS
      })
      .subscribe({
        next: (sesion) => {
          this.enviando.set(false);
          this.sesion.set(sesion);
          // TODO: cuando existan las pantallas internas, aqui va el
          // router.navigate() segun el rol (usuario o mecanico).
        },
        error: (error: Error) => {
          this.enviando.set(false);
          this.errorServidor.set(error.message);
        },
      });
  }

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.sesion.set(null);
    this.formulario.reset();
  }
}