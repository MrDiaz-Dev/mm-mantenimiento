//#region Imports
import { Component } from '@angular/core';
//#endregion

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false,
})
export class InicioPage {
  //#region Variables
  public readonly nombreMarca = 'Training App';
  //#endregion
}
