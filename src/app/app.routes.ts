import { Routes, RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';

export const routes: Routes = [
    // otras rutas
    {path: '', // Ruta raíz (por defecto)
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)}, // Carga HomeComponent aquí
    {path: 'contacto', loadComponent: () => import('./components/contacto/contacto.component').then(m => m.ContactoComponent)},	
    {path: 'admin', loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)},
    {path: 'trabajadores', loadComponent: () => import('./components/admin/trabajadores/trabajadores.component').then(m => m.TrabajadoresComponent)},
    {path: 'auditorias', loadComponent: () => import('./components/admin/auditorias/auditorias.component').then(m => m.AuditoriasComponent)},		
    {path: 'documentos', loadComponent: () => import('./components/admin/documentos/documentos.component').then(m => m.DocumentosComponent)},		
    {path: 'sanciones', loadComponent: () => import('./components/admin/sanciones/sanciones.component').then(m => m.SancionesComponent)},
    {path: 'permisos', loadComponent: () => import('./components/admin/permisos/permisos.component').then(m => m.PermisosComponent)},	
    {path: 'user', loadComponent: () => import('./components/user/user.component').then(m => m.UserComponent)},		
    {path: 'userpermiso', loadComponent: () => import('./components/user/userpermiso/userpermiso.component').then(m => m.UserpermisoComponent)},
    {path: 'usersanciones', loadComponent: () => import('./components/user/usersanciones/usersanciones.component').then(m => m.UsersancionesComponent)},
    


];
