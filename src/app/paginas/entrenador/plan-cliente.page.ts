//#region Imports
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { Perfil } from '../../servicios/autenticacion.servicio';
import {
  DiaEditable,
  EjercicioCatalogo,
  LETRAS_DIA,
  LetraDia,
  LineaEjercicio,
  RutinasServicio,
} from '../../servicios/rutinas.servicio';
//#endregion

@Component({
  selector: 'app-plan-cliente',
  templateUrl: './plan-cliente.page.html',
  styleUrls: ['./plan-cliente.page.scss'],
  standalone: false,
})
export class PlanClientePage implements OnInit {
  //#region Variables
  public cliente: Perfil | null = null;
  public catalogo: EjercicioCatalogo[] = [];
  public titulo = '';
  public objetivo = '';
  public dias: DiaEditable[] = [];
  public letraActiva: LetraDia = 'A';
  public cargando = true;

  private readonly ruta = inject(ActivatedRoute);
  private readonly enrutador = inject(Router);
  private readonly rutinas = inject(RutinasServicio);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  //#endregion

  //#region Methods
  public async ngOnInit(): Promise<void> {
    const clienteId = this.ruta.snapshot.paramMap.get('id');
    if (!clienteId) {
      await this.enrutador.navigateByUrl('/entrenador');
      return;
    }

    this.dias = LETRAS_DIA.map((letra) => this.diaVacio(letra));

    try {
      const [cliente, catalogo, plan] = await Promise.all([
        this.rutinas.obtenerCliente(clienteId),
        this.rutinas.listarEjercicios(),
        this.rutinas.obtenerPlanActivo(clienteId),
      ]);

      this.cliente = cliente;
      this.catalogo = catalogo;

      if (plan) {
        this.titulo = plan.titulo;
        this.objetivo = plan.objetivo ?? '';
        for (const dia of plan.dias) {
          const destino = this.dias.find((d) => d.letra_dia === dia.letra_dia);
          if (!destino) {
            continue;
          }
          destino.nombre = dia.nombre ?? `Entrenamiento ${dia.letra_dia}`;
          destino.enfoque = dia.enfoque ?? '';
          destino.ejercicios = dia.ejercicios.map((linea) => ({ ...linea }));
        }
      }
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  //#region Día activo
  public get diaActivo(): DiaEditable {
    return this.dias.find((dia) => dia.letra_dia === this.letraActiva)!;
  }

  public cambiarLetra(letra: string | number | undefined): void {
    if (typeof letra === 'string' && LETRAS_DIA.includes(letra as LetraDia)) {
      this.letraActiva = letra as LetraDia;
    }
  }

  public anadirEjercicio(): void {
    const primero = this.catalogo[0];
    if (!primero) {
      void this.mostrarToast('No hay ejercicios en el catálogo.');
      return;
    }

    const linea: LineaEjercicio = {
      ejercicio_id: primero.id,
      series: 3,
      repeticiones: 10,
      carga_kg: null,
      descanso_segundos: 60,
      observaciones: null,
      orden: this.diaActivo.ejercicios.length + 1,
      ejercicio: primero,
    };
    this.diaActivo.ejercicios.push(linea);
  }

  public quitarEjercicio(indice: number): void {
    this.diaActivo.ejercicios.splice(indice, 1);
  }
  //#endregion

  //#region Guardado
  public async guardar(): Promise<void> {
    if (!this.cliente) {
      return;
    }

    if (!this.titulo.trim()) {
      await this.mostrarToast('Introduce un título para el plan.');
      return;
    }

    const carga = await this.loadingCtrl.create({ message: 'Guardando plan…' });
    await carga.present();
    try {
      await this.rutinas.guardarPlan(
        this.cliente.id,
        this.titulo.trim(),
        this.objetivo.trim(),
        this.dias
      );
      await this.mostrarToast('Plan guardado.', 'success');
      await this.enrutador.navigateByUrl('/entrenador');
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      await carga.dismiss();
    }
  }
  //#endregion

  //#region Auxiliares
  public nombreVisible(perfil: Perfil): string {
    return perfil.nombre_completo?.trim() || perfil.email || 'Sin nombre';
  }

  private diaVacio(letra: LetraDia): DiaEditable {
    return {
      letra_dia: letra,
      nombre: `Entrenamiento ${letra}`,
      enfoque: '',
      ejercicios: [],
    };
  }

  private mensajeError(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }
    return 'No se pudo completar la operación.';
  }

  private async mostrarToast(
    mensaje: string,
    color: 'danger' | 'success' = 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3500,
      color,
      position: 'top',
    });
    await toast.present();
  }
  //#endregion
  //#endregion
}
