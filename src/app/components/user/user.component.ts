import { Component } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { SidebarComponent  } from './sidebar/sidebar.component';
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [HomeComponent, SidebarComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

}
