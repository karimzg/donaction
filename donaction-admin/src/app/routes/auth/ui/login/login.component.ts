import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthFacade } from '../../data-access/+state/auth.facade';
import { ProgressBarModule } from 'primeng/progressbar';
import { PasswordModule } from 'primeng/password';

// import { GoogleSigninButtonModule, SocialLoginModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    PanelModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    ProgressBarModule,
    PasswordModule,
    RouterModule,
    // SocialLoginModule,
    // GoogleSigninButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private authFacade = inject(AuthFacade);
  private router = inject(Router)
  private route = inject(ActivatedRoute);
  // private googleAuthService = inject(GoogleAuthService);


  public loginForm!: FormGroup;
  public submitted = false;
  // selectors signals
  public error = this.authFacade.error;
  public me = this.authFacade.me;
  public loading = this.authFacade.loading;
  progressValue = signal(0);

  constructor() {
    effect(() => {
      if (this.authFacade.me()) {
        let counter = 0;
        const interval = setInterval(() => {
          this.progressValue.set(++counter * 33.333);
          if (counter === 3) {
            clearInterval(interval);
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
          }
        }, 1000);
      }
    });
  }

  ngOnInit() {
    // Subscribe to the queryParams Observable to get the redirectUrl
    // TODO: Fix redirectUrl. Call it in a guard...?
    // this.route.queryParams.subscribe(params => {
    //   const redirectUrl = params['redirectUrl'];
    // });

    this.init_form();
  }

  private init_form(): void {
    this.loginForm = new FormGroup({
      identifier: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.authFacade.login(this.loginForm.value);
  }

}
