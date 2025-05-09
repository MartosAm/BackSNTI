import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AdminbarraComponent } from '../adminbarra/adminbarra.component';


@Component({
  selector: 'app-trabajadores',
  standalone: true,
  imports: [MatIconModule, RouterLink, AdminbarraComponent ],
  templateUrl: './trabajadores.component.html',
  styleUrl: './trabajadores.component.css'
})
export class TrabajadoresComponent {

}

