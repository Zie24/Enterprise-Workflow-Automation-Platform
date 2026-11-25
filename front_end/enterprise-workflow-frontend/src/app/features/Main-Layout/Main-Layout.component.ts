
import { Component, inject } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router
} from '@angular/router';

import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
NavBarComponent
  ],
  templateUrl: './Main-Layout.component.html',
  styleUrl: './Main-Layout.component.css'
})
export class MainLayoutComponent {

  private router = inject(Router);

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
