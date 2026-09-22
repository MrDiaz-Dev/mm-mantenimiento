//#region Imports
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TemaServicio } from './servicios/tema.servicio';
//#endregion

//#region Methods
function inicializarTemaApp(temaServicio: TemaServicio): () => Promise<void> {
  return () => temaServicio.inicializarTema();
}
//#endregion

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: inicializarTemaApp,
      deps: [TemaServicio],
      multi: true,
    },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.modo-oscuro',
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
