//#region Imports
import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

import {
  AlmacenamientoClienteServicio,
  CLAVE_TEMA,
} from './almacenamiento-cliente.servicio';
//#endregion

//#region Constants
export type PreferenciaTema = 'oscuro' | 'claro';

const CLASE_MODO_OSCURO = 'modo-oscuro';
const CLASE_PALETA_IONIC = 'ion-palette-dark';
//#endregion

@Injectable({
  providedIn: 'root',
})
export class TemaServicio {
  //#region Variables
  public readonly modoOscuroActivo = signal(false);
  //#endregion

  //#region Methods
  constructor(
    private readonly almacenamiento: AlmacenamientoClienteServicio
  ) {}

  //#region Ciclo de vida del tema
  public async inicializarTema(): Promise<void> {
    const preferenciaGuardada = await this.almacenamiento.obtener(CLAVE_TEMA);
    const preferenciaValida =
      preferenciaGuardada === 'oscuro' || preferenciaGuardada === 'claro';

    if (preferenciaValida) {
      await this.aplicarTema(preferenciaGuardada === 'oscuro', false);
      return;
    }

    const prefiereOscuroSistema =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    await this.aplicarTema(prefiereOscuroSistema, true);
  }

  public async alternarTema(): Promise<void> {
    await this.aplicarTema(!this.modoOscuroActivo(), true);
  }

  public async aplicarTema(
    oscuro: boolean,
    persistir: boolean = true
  ): Promise<void> {
    const raiz = document.documentElement;

    if (oscuro) {
      raiz.classList.add(CLASE_MODO_OSCURO, CLASE_PALETA_IONIC);
    } else {
      raiz.classList.remove(CLASE_MODO_OSCURO, CLASE_PALETA_IONIC);
    }

    this.modoOscuroActivo.set(oscuro);

    if (persistir) {
      const valor: PreferenciaTema = oscuro ? 'oscuro' : 'claro';
      await this.almacenamiento.guardar(CLAVE_TEMA, valor);
    }

    await this.sincronizarBarraEstadoNativa(oscuro);
  }
  //#endregion

  //#region Capacitor nativo
  private async sincronizarBarraEstadoNativa(oscuro: boolean): Promise<void> {
    const esNativo = Capacitor.isNativePlatform();
    if (!esNativo) {
      return;
    }

    try {
      await StatusBar.setStyle({
        style: oscuro ? Style.Dark : Style.Light,
      });
    } catch {
      // StatusBar no disponible en todos los entornos nativos de prueba
    }
  }
  //#endregion
  //#endregion
}
