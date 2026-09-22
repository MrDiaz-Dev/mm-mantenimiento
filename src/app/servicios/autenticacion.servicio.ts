//#region Imports
import { Injectable, signal } from '@angular/core';
import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';

import { environment } from '../../environments/environment';
//#endregion

//#region Constants
export type RolPerfil = 'admin' | 'cliente';

export interface Perfil {
  id: string;
  rol: RolPerfil;
  nombre_completo: string | null;
  email: string | null;
  url_avatar: string | null;
  entrenador_id: string | null;
}
//#endregion

@Injectable({
  providedIn: 'root',
})
export class AutenticacionServicio {
  //#region Variables
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  public readonly sesion = signal<Session | null>(null);
  public readonly perfil = signal<Perfil | null>(null);

  private resolucionInicializacion!: () => void;
  private readonly promesaInicializacion = new Promise<void>((resolver) => {
    this.resolucionInicializacion = resolver;
  });
  //#endregion

  //#region Methods
  constructor() {
    void this.inicializarSesion();
  }

  //#region Ciclo de vida de sesión
  public get cliente(): SupabaseClient {
    return this.supabase;
  }

  public esperarInicializacion(): Promise<void> {
    return this.promesaInicializacion;
  }

  public rutaSegunRol(rol: RolPerfil | null | undefined): string {
    return rol === 'admin' ? '/entrenador' : '/alumno';
  }

  private async inicializarSesion(): Promise<void> {
    try {
      const { data } = await this.supabase.auth.getSession();
      await this.aplicarSesion(data.session);
    } finally {
      this.resolucionInicializacion();
    }

    this.supabase.auth.onAuthStateChange(
      (_evento: AuthChangeEvent, sesion: Session | null) => {
        void this.aplicarSesion(sesion);
      }
    );
  }

  private async aplicarSesion(sesion: Session | null): Promise<void> {
    this.sesion.set(sesion);

    if (!sesion?.user) {
      this.perfil.set(null);
      return;
    }

    await this.obtenerPerfil(sesion.user.id);
  }
  //#endregion

  //#region Acceso
  public async iniciarSesion(
    correo: string,
    contrasena: string
  ): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    if (error) {
      throw error;
    }

    await this.aplicarSesion(data.session);
  }

  public async registrar(
    correo: string,
    contrasena: string,
    nombreCompleto: string,
    rol: RolPerfil
  ): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        data: {
          rol,
          nombre_completo: nombreCompleto,
        },
      },
    });

    if (error) {
      throw error;
    }

    await this.aplicarSesion(data.session);
  }

  public async cerrarSesion(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw error;
    }

    this.sesion.set(null);
    this.perfil.set(null);
  }
  //#endregion

  //#region Perfil
  public async obtenerPerfil(idUsuario?: string): Promise<Perfil | null> {
    const id = idUsuario ?? this.sesion()?.user?.id;

    if (!id) {
      this.perfil.set(null);
      return null;
    }

    const { data, error } = await this.supabase
      .from('perfiles')
      .select(
        'id, rol, nombre_completo, email, url_avatar, entrenador_id'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const perfil = (data as Perfil | null) ?? null;
    this.perfil.set(perfil);
    return perfil;
  }
  //#endregion
  //#endregion
}
