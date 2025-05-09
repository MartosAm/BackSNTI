import { Component,  OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AdminbarraComponent } from '../adminbarra/adminbarra.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [MatIconModule, RouterLink, AdminbarraComponent,MatProgressSpinnerModule, MatCardModule],
  templateUrl: './permisos.component.html',
  styleUrl: './permisos.component.css'
})
export class PermisosComponent {
  
}


