import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';



export const PATRON_CORREO = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


export const PATRON_NOMBRE = /^[a-zA-ZÀ-ÿñÑ' -]{3,60}$/;


export const PATRON_TELEFONO = /^[0-9]{10}$/;


export const PATRON_CONTRASENA = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;


export function contrasenasCoinciden(
  campoContrasena: string,
  campoConfirmar: string
): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const contrasena = grupo.get(campoContrasena)?.value;
    const confirmar = grupo.get(campoConfirmar)?.value;


    if (!confirmar) {
      return null;
    }

    return contrasena === confirmar ? null : { noCoinciden: true };
  };
}

export function alMenosUno(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  return Array.isArray(valor) && valor.length > 0 ? null : { vacio: true };
}


export function sinEspaciosSobrantes(control: AbstractControl): ValidationErrors | null {
  const valor: string = control.value ?? '';
  return valor.trim().length === 0 && valor.length > 0 ? { soloEspacios: true } : null;
}
