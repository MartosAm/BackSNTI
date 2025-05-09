import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
//importo los componentes aunque ya no son necesarios porque los estoy importando en el app.routes.ts
import { ContactoComponent } from '../contacto/contacto.component';
import { AdminbarraComponent } from './adminbarra/adminbarra.component';

import { HomeComponent } from '../home/home.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ AdminbarraComponent,HomeComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
