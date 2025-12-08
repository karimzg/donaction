import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GoogleAuthService } from '../data-access/repositories/google-auth.service';

@Component({
  selector: 'app-auth',
  imports: [RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  providers: [GoogleAuthService]
})
export class AuthComponent {
}
