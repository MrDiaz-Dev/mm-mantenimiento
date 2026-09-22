//#region Imports
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
//#endregion

//#region Methods
export const guardiaAutenticacion: CanActivateFn = async () => {
  const autenticacion = inject(AutenticacionServicio);
  const enrutador = inject(Router);

  await autenticacion.esperarInicializacion();

  if (autenticacion.sesion()) {
    return true;
  }

  return enrutador.parseUrl('/iniciar-sesion');
};

export const guardiaInvitado: CanActivateFn = async () => {
  const autenticacion = inject(AutenticacionServicio);
  const enrutador = inject(Router);

  await autenticacion.esperarInicializacion();

  if (!autenticacion.sesion()) {
    return true;
  }

  return enrutador.parseUrl(
    autenticacion.rutaSegunRol(autenticacion.perfil()?.rol)
  );
};

export const guardiaSoloEntrenador: CanActivateFn = async () => {
  const autenticacion = inject(AutenticacionServicio);
  const enrutador = inject(Router);

  await autenticacion.esperarInicializacion();

  if (!autenticacion.sesion()) {
    return enrutador.parseUrl('/iniciar-sesion');
  }

  if (autenticacion.perfil()?.rol === 'admin') {
    return true;
  }

  return enrutador.parseUrl('/alumno');
};

export const guardiaSoloCliente: CanActivateFn = async () => {
  const autenticacion = inject(AutenticacionServicio);
  const enrutador = inject(Router);

  await autenticacion.esperarInicializacion();

  if (!autenticacion.sesion()) {
    return enrutador.parseUrl('/iniciar-sesion');
  }

  if (autenticacion.perfil()?.rol === 'cliente') {
    return true;
  }

  return enrutador.parseUrl('/entrenador');
};
//#endregion
