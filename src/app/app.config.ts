//#region Imports
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  RouteReuseStrategy,
  withPreloading,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { APP_ROUTES } from './app.routes';
import { Tema } from './core/tema';
//#endregion

//#region Constants
export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.modo-oscuro',
        },
      },
    }),
    provideAppInitializer(() => inject(Tema).inicializarTema()),
  ],
};
//#endregion
