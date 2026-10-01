//#region Imports
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AutenticacionSesion } from './autenticacion-sesion';
//#endregion

//#region Methods
export const guardiaAutenticacion: CanActivateFn = async () => {
  const autenticacion = inject(AutenticacionSesion);
  const enrutador = inject(Router);

  await autenticacion.esperarInicializacion();

  if (autenticacion.sesion() && autenticacion.perfil()) {
    return true;
  }

  return enrutador.parseUrl('/iniciar-sesion');
};

export const guardiaInvitado: CanActivateFn = async () => {
  const autenticacion = inject(AutenticacionSesion);
  const enrutador = inject(Router);

  await autenticacion.esperarInicializacion();

  const perfil = autenticacion.perfil();
  if (!autenticacion.sesion() || !perfil) {
    return true;
  }

  return enrutador.parseUrl(autenticacion.rutaSegunRol(perfil.rol));
};

export const guardiaSoloAdmin: CanActivateFn = crearGuardiaDeRol('admin');
export const guardiaSoloEntrenador: CanActivateFn =
  crearGuardiaDeRol('entrenador');
export const guardiaSoloCliente: CanActivateFn = crearGuardiaDeRol('cliente');

function crearGuardiaDeRol(
  rolExigido: 'admin' | 'entrenador' | 'cliente'
): CanActivateFn {
  return async () => {
    const autenticacion = inject(AutenticacionSesion);
    const enrutador = inject(Router);

    await autenticacion.esperarInicializacion();

    const perfil = autenticacion.perfil();
    if (!autenticacion.sesion() || !perfil) {
      return enrutador.parseUrl('/iniciar-sesion');
    }

    if (perfil.rol === rolExigido) {
      return true;
    }

    return enrutador.parseUrl(autenticacion.rutaSegunRol(perfil.rol));
  };
}
//#endregion
