//#region Imports
import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
//#endregion

@Directive({
  selector: 'ion-content[cerrarOverlayAlDeslizar]',
  standalone: true,
})
export class CerrarOverlayAlDeslizarDirective implements AfterViewInit, OnDestroy {
  //#region Variables
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zona = inject(NgZone);
  private contenedor?: HTMLElement;
  private destruido = false;
  //#endregion

  //#region Methods
  //#region Ciclo de vida
  public async ngAfterViewInit(): Promise<void> {
    const ion = this.host.nativeElement as HTMLElement & {
      getScrollElement?: () => Promise<HTMLElement>;
    };
    this.contenedor = ion.getScrollElement
      ? await ion.getScrollElement()
      : (ion.shadowRoot?.querySelector('.inner-scroll') as HTMLElement) ?? ion;
    if (this.destruido) {
      return;
    }
    this.contenedor.addEventListener('scroll', this.ocultar, { passive: true });
  }

  public ngOnDestroy(): void {
    this.destruido = true;
    this.contenedor?.removeEventListener('scroll', this.ocultar);
  }
  //#endregion

  //#region Cerrar overlay
  /**
   * PrimeNG ignora `resize`/`Escape` en dispositivos táctiles (`!isTouchDevice()`),
   * y no ve el `.inner-scroll` de ion-content (está en shadow DOM).
   * Un click en document sí cierra el overlay en todos los dispositivos.
   */
  private readonly ocultar = (): void => {
    if (!document.querySelector('.p-select-overlay')) {
      return;
    }
    this.zona.run(() => {
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  };
  //#endregion
  //#endregion
}
