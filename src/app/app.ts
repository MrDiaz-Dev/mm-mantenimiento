//#region Imports
import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  arrowDown,
  arrowUp,
  barbellOutline,
  chevronDown,
  chevronForward,
  clipboardOutline,
  logOutOutline,
  moonOutline,
  peopleOutline,
  repeatOutline,
  sunnyOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';

import { AutenticacionSesion } from './autenticacion/autenticacion-sesion';
//#endregion

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  imports: [IonApp, IonRouterOutlet],
})
export class App {
  //#region Variables
  /** Arranca getSession / onAuthStateChange al cargar la app. */
  private readonly autenticacionSesion = inject(AutenticacionSesion);
  //#endregion

  //#region Methods
  constructor() {
    addIcons({
      add,
      arrowDown,
      arrowUp,
      barbellOutline,
      chevronDown,
      chevronForward,
      clipboardOutline,
      logOutOutline,
      moonOutline,
      peopleOutline,
      repeatOutline,
      sunnyOutline,
      timeOutline,
      trashOutline,
    });
  }
  //#endregion
}
