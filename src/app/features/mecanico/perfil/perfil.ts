import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { MecanicoService } from '../../../core/services/mecanico.service';
import { SesionService } from '../../../core/services/sesion.service';
import { BarraSuperior } from '../../../shared/barra-superior/barra-superior';
import { MenuMecanico } from '../menu-mecanico/menu-mecanico';
import { SoloNumeros } from '../../../shared/directivas/solo-numeros';
import { PATRON_TELEFONO } from '../../../core/validadores/validadores';
import { Coordenadas, MapaUbicacion } from '../../../shared/mapa-ubicacion/mapa-ubicacion';

const OAXACA_LAT = 17.0654;
const OAXACA_LNG = -96.7237;

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, BarraSuperior, MapaUbicacion, MenuMecanico, SoloNumeros],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly mecanicoService = inject(MecanicoService);
  private readonly auth = inject(AuthService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly buscandoUbicacion = signal(false);
  protected readonly avisoUbicacion = signal<string | null>(null);
  protected readonly errorServidor = signal<string | null>(null);

  protected readonly latitud = signal(0);
  protected readonly longitud = signal(0);

  protected readonly formulario = this.fb.nonNullable.group({
    nombreTaller: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(200)]],
    zonaTrabajo: ['', [Validators.required, Validators.minLength(4)]],
    direccion: ['', [Validators.required, Validators.maxLength(255)]],
  });

  protected readonly formularioDatos = this.fb.nonNullable.group({
    telefono: ['', [Validators.required, Validators.pattern(PATRON_TELEFONO)]],
  });

  protected readonly guardandoDatos = signal(false);
  protected readonly datosGuardados = signal(false);

  protected readonly correo = computed(() => this.sesion.usuario()?.correo ?? '');
  protected readonly nombre = computed(() => this.sesion.usuario()?.nombre ?? '');

  protected readonly tieneUbicacion = computed(
    () => this.latitud() !== 0 && this.longitud() !== 0
  );

  protected readonly centroLat = computed(() =>
    this.tieneUbicacion() ? this.latitud() : OAXACA_LAT
  );

  protected readonly centroLng = computed(() =>
    this.tieneUbicacion() ? this.longitud() : OAXACA_LNG
  );

  protected readonly coordenadas = computed(
    () => `${this.latitud().toFixed(5)}, ${this.longitud().toFixed(5)}`
  );

  ngOnInit(): void {
    this.formularioDatos.patchValue({
      telefono: this.sesion.usuario()?.telefono ?? '',
    });

    this.mecanicoService.cargarPerfil().subscribe({
      next: (perfil) => {
        if (perfil) {
          this.formulario.patchValue({
            nombreTaller: perfil.nombreTaller ?? '',
            descripcion: perfil.descripcion ?? '',
            zonaTrabajo: perfil.zonaTrabajo ?? '',
            direccion: perfil.direccion ?? '',
          });
          this.latitud.set(perfil.latitud ?? 0);
          this.longitud.set(perfil.longitud ?? 0);
        }
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  protected get caracteresRestantes(): number {
    return 200 - this.formulario.controls.descripcion.value.length;
  }

  protected mostrarError(
    campo: keyof typeof this.formulario.controls
  ): boolean {
    const control = this.formulario.controls[campo];
    return control ? control.invalid && control.touched : false;
  }

  protected moverPin(coordenadas: Coordenadas): void {
    this.latitud.set(coordenadas.latitud);
    this.longitud.set(coordenadas.longitud);
    this.avisoUbicacion.set(null);
  }

  protected usarMiUbicacion(): void {
    this.avisoUbicacion.set(null);

    if (!('geolocation' in navigator)) {
      this.avisoUbicacion.set('Tu navegador no permite obtener la ubicación.');
      return;
    }

    this.buscandoUbicacion.set(true);

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        this.latitud.set(posicion.coords.latitude);
        this.longitud.set(posicion.coords.longitude);
        this.buscandoUbicacion.set(false);
      },
      () => {
        this.buscandoUbicacion.set(false);
        this.avisoUbicacion.set(
          'No pudimos obtener tu ubicación. Márcala tú en el mapa tocando dónde estás.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  protected guardar(): void {
    this.errorServidor.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (!this.tieneUbicacion()) {
      this.avisoUbicacion.set('Falta marcar tu ubicación en el mapa.');
      return;
    }

    this.guardando.set(true);
    const datos = this.formulario.getRawValue();
    const existePerfil = !!this.mecanicoService.perfil();

    const payload = {
      nombreTaller: datos.nombreTaller.trim(),
      descripcion: datos.descripcion.trim(),
      zonaTrabajo: datos.zonaTrabajo.trim(),
      direccion: datos.direccion.trim(),
      telefono: this.formularioDatos.controls.telefono.value.trim(),
      latitud: this.latitud(),
      longitud: this.longitud(),
    };

    const peticion$ = existePerfil
      ? this.mecanicoService.actualizarPerfil(payload)
      : this.mecanicoService.crearPerfil(payload);

    peticion$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/mecanico']).catch((err) => {
          console.error('Error al redirigir tras guardar:', err);
        });
      },
      error: (err) => {
        console.error('Error al guardar perfil:', err);
        this.guardando.set(false);
        this.errorServidor.set('No pudimos guardar tu perfil. Intenta de nuevo.');
      },
    });
  }

  protected mostrarErrorTelefono(): boolean {
    const control = this.formularioDatos.controls.telefono;
    return control.invalid && control.touched;
  }

  protected guardarDatos(): void {
    this.errorServidor.set(null);
    this.datosGuardados.set(false);

    if (this.formularioDatos.invalid || this.guardandoDatos()) {
      this.formularioDatos.markAllAsTouched();
      return;
    }

    this.guardandoDatos.set(true);

    this.auth
      .actualizarDatos({ telefono: this.formularioDatos.getRawValue().telefono })
      .subscribe({
        next: () => {
          this.guardandoDatos.set(false);
          this.datosGuardados.set(true);
          this.formularioDatos.markAsPristine();
        },
        error: (err) => {
          console.error('Error al actualizar teléfono:', err);
          this.guardandoDatos.set(false);
          this.errorServidor.set('No pudimos guardar tu teléfono. Intenta de nuevo.');
        },
      });
  }

  protected readonly confirmando = signal(false);
  protected readonly eliminando = signal(false);

  protected pedirConfirmacion(): void {
    this.confirmando.set(true);
  }

  protected cancelarEliminar(): void {
    this.confirmando.set(false);
  }

  protected eliminarCuenta(): void {
    if (this.eliminando()) return;

    this.eliminando.set(true);

    this.auth.eliminarCuenta().subscribe({
      next: () => {
        this.router.navigate(['/']).catch((err) => {
          console.error('Error al redirigir tras eliminar:', err);
        });
      },
      error: (err) => {
        console.error('Error al eliminar cuenta:', err);
        this.eliminando.set(false);
        this.confirmando.set(false);
        this.errorServidor.set('No pudimos eliminar la cuenta. Intenta de nuevo.');
      },
    });
  }
}