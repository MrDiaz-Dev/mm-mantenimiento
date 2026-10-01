//#region Imports
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';
//#endregion

bootstrapApplication(App, appConfig).catch((err) => console.log(err));
