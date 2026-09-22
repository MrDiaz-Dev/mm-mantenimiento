//#region Imports
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
//#endregion

//#region Constants
/** Claves de preferencias de cliente (web + nativo vía Capacitor Preferences). */
export const CLAVE_TEMA = 'mm.tema';
//#endregion

@Injectable({
  providedIn: 'root',
})
export class AlmacenamientoClienteServicio {
  //#region Methods
  //#region Lectura / escritura
  /**
   * Lee un valor persistido en el cliente.
   * En web usa localStorage (fallback de Preferences); en iOS/Android, almacenamiento nativo.
   */
  public async obtener(clave: string): Promise<string | null> {
    const resultado = await Preferences.get({ key: clave });
    return resultado.value;
  }

  public async guardar(clave: string, valor: string): Promise<void> {
    await Preferences.set({ key: clave, value: valor });
  }

  public async eliminar(clave: string): Promise<void> {
    await Preferences.remove({ key: clave });
  }
  //#endregion
  //#endregion
}
