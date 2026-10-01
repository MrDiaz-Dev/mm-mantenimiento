//#region Imports
import { Component } from '@angular/core';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
//#endregion

@Component({
  selector: 'app-pestanas-alumno',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="ficha" href="/alumno/ficha">
          <ion-icon name="clipboard-outline" aria-hidden="true"></ion-icon>
          <ion-label>Ficha</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="historial" href="/alumno/historial">
          <ion-icon name="time-outline" aria-hidden="true"></ion-icon>
          <ion-label>Historial</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  host: { class: 'ion-page' },
})
export class PestanasAlumno {}
