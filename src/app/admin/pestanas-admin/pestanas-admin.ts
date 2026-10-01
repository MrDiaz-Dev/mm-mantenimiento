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
  selector: 'app-pestanas-admin',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="alumnos" href="/admin/alumnos">
          <ion-icon name="people-outline" aria-hidden="true"></ion-icon>
          <ion-label>Alumnos</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  host: { class: 'ion-page' },
})
export class PestanasAdmin {}
