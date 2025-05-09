import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AdminbarraComponent } from '../adminbarra/adminbarra.component';

@Component({
  selector: 'app-sanciones',
  standalone: true,
  imports: [MatIconModule, RouterLink, AdminbarraComponent],
  templateUrl: './sanciones.component.html',
  styleUrl: './sanciones.component.css'
})
export class SancionesComponent {

}
