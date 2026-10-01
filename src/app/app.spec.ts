//#region Imports
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { App } from './app';
import { AutenticacionSesion } from './autenticacion/autenticacion-sesion';
//#endregion

describe('App', () => {
  //#region Methods
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideIonicAngular(),
        provideRouter([]),
        { provide: AutenticacionSesion, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza el outlet de Ionic', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const app = fixture.nativeElement as HTMLElement;
    expect(app.querySelector('ion-app')).toBeTruthy();
    expect(app.querySelector('ion-router-outlet')).toBeTruthy();
  });
  //#endregion
});
