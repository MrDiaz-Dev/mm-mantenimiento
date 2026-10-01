//#region Imports
import { Component, inject } from '@angular/core';
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

import { AutenticacionServicio } from './servicios/autenticacion.servicio';
//#endregion

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  //#region Variables
  /** Arranca getSession / onAuthStateChange al cargar la app. */
  private readonly autenticacionServicio = inject(AutenticacionServicio);
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
