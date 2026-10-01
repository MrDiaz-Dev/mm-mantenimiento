//#region Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { BotonTemaModule } from '../../componentes/boton-tema/boton-tema.module';
import { CerrarOverlayAlDeslizarDirective } from '../../directivas/cerrar-overlay-al-deslizar.directiva';
import { EntrenadorPageRoutingModule } from './entrenador-routing.module';
import { EntrenadorPage } from './entrenador.page';
import { EntrenamientoEditorPage } from './entrenamiento-editor.page';
import { EntrenamientosPage } from './entrenamientos.page';
import { PestanasEntrenadorPage } from './pestanas-entrenador.page';
import { PlanClientePage } from './plan-cliente.page';
//#endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InputNumber,
    InputText,
    Select,
    Textarea,
    CerrarOverlayAlDeslizarDirective,
    BotonTemaModule,
    EntrenadorPageRoutingModule,
  ],
  declarations: [
    PestanasEntrenadorPage,
    EntrenadorPage,
    EntrenamientosPage,
    EntrenamientoEditorPage,
    PlanClientePage,
  ],
})
export class EntrenadorPageModule {}
