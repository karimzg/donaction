import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../../data-access/+state/auth.facade';
import { Router, RouterModule } from '@angular/router';
import { RegisterRequest } from '../../model/registerRequest';
// import { GoogleSigninButtonModule, SocialLoginModule } from '@abacritt/angularx-social-login';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { PasswordModule } from 'primeng/password';
import { ErrorDisplayComponent } from '@shared/components/form/error-display/error-display.component';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    PanelModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    ProgressBarModule,
    PasswordModule,
    ErrorDisplayComponent,
    RouterModule,
    // SocialLoginModule,
    // GoogleSigninButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private authFacade = inject(AuthFacade);
  // private googleAuthService = inject(GoogleAuthService);
  private router = inject(Router);
  isSubmitted = signal(false);
  progressValue = signal(0);

  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  public error = this.authFacade.error;
  public me = this.authFacade.me;
  public loading = this.authFacade.loading;
  private unsubscribe$ = new Subject<boolean>();

  constructor() {
    this.initializeEffects();
  }

  ngOnInit(): void {
  }

  private initializeEffects(): void {
    effect(() => {
      if (this.authFacade.me()) {
        this.incrementProgress();
      }
    });
  }

  private incrementProgress(): void {
    let counter = 0;
    const interval = setInterval(() => {
      this.progressValue.set(++counter * 33.333);
      if (counter === 3) {
        clearInterval(interval);
        this.router.navigate(['']);
      }
    }, 1000);
  }


  public onSubmit(): void {
    this.isSubmitted.set(true);
    if (this.registerForm.valid) {
      const firstName = this.registerForm.value.firstName!;
      const lastName = this.registerForm.value.lastName!;
      const email = this.registerForm.value.email!;
      const password = this.registerForm.value.password!;
      const randomNumber = Math.floor(100 + Math.random() * 900);
      const username = `${firstName}${lastName}${randomNumber}`;
      const registerRequest: RegisterRequest = {
        email,
        password,
        username,
        nom: firstName,
        prenom: lastName,
      };
      this.authFacade.register(registerRequest);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }
}
