//#region Imports
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { Perfil } from '../../servicios/autenticacion.servicio';
import {
  EntrenamientoResumen,
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
  public biblioteca: EntrenamientoResumen[] = [];
  public asignados: EntrenamientoResumen[] = [];
  public seleccionadoId = '';
  public titulo = '';
  public objetivo = '';
  public pesoKg: number | null = null;
  public alturaM: number | null = null;
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

    try {
      const [cliente, biblioteca, plan, metrica] = await Promise.all([
        this.rutinas.obtenerCliente(clienteId),
        this.rutinas.listarEntrenamientos(),
        this.rutinas.obtenerPlanActivo(clienteId),
        this.rutinas.obtenerUltimaMetrica(clienteId),
      ]);

      this.cliente = cliente;
      this.biblioteca = biblioteca;
      this.pesoKg = metrica?.peso_kg ?? null;
      this.alturaM = metrica?.altura_m ?? null;

      if (plan) {
        this.titulo = plan.titulo;
        this.objetivo = plan.objetivo ?? '';
        this.asignados = plan.entrenamientos.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          descripcion: item.descripcion,
        }));
      }
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  //#region Lista de entrenamientos
  public get disponibles(): EntrenamientoResumen[] {
    const usados = new Set(this.asignados.map((item) => item.id));
    return this.biblioteca.filter((item) => !usados.has(item.id));
  }

  public anadirSeleccionado(): void {
    const elegido = this.disponibles.find(
      (item) => item.id === this.seleccionadoId
    );
    if (!elegido) {
      return;
    }
    this.asignados.push(elegido);
    this.seleccionadoId = this.disponibles[0]?.id ?? '';
  }

  public quitar(indice: number): void {
    this.asignados.splice(indice, 1);
  }

  public subir(indice: number): void {
    if (indice === 0) {
      return;
    }
    const [item] = this.asignados.splice(indice, 1);
    this.asignados.splice(indice - 1, 0, item);
  }

  public bajar(indice: number): void {
    if (indice >= this.asignados.length - 1) {
      return;
    }
    const [item] = this.asignados.splice(indice, 1);
    this.asignados.splice(indice + 1, 0, item);
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
        this.asignados.map((item) => item.id),
        { peso_kg: this.pesoKg, altura_m: this.alturaM }
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

  public iniciales(perfil: Perfil): string {
    const fuente = perfil.nombre_completo?.trim() || perfil.email || '?';
    return fuente
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join('')
      .toUpperCase();
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
