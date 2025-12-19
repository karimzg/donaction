import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  InformationsImageCardComponent
} from "@shared/components/medias/informations-image-card/informations-image-card.component";
import { Button } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { ReactiveFormsModule } from "@angular/forms";
import { TextareaModule } from "primeng/textarea";
import { RecaptchaFormsModule, RecaptchaModule } from "ng-recaptcha-2";
import { ToastModule } from "primeng/toast";
import { ContactFormComponent } from "@shared/components/contact-form/contact-form.component";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { AnalyticsService } from "@shared/services/analytics/analytics.service";

@Component({
  selector: 'app-help-center',
  imports: [
    InformationsImageCardComponent,
    Button,
    DialogModule,
    CardModule,
    InputTextModule,
    PaginatorModule,
    ReactiveFormsModule,
    TextareaModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    ToastModule,
    ContactFormComponent,
  ],
  providers: [],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.scss',
  animations: [fadeAnimation]
})
export class HelpCenterComponent {
  private analyticsService = inject(AnalyticsService);

  public showContactDialog: WritableSignal<boolean> = signal<boolean>(false);

  public toggleContactDialog(): void {
    this.showContactDialog.set(!this.showContactDialog());
    if (this.showContactDialog()) {
      this.analyticsService.trackPageview({customUrl: '/contact-pop-up'});
    }
  }

  handleDialogState($event: undefined | boolean) {
    if ($event !== undefined) {
      this.showContactDialog.set($event);
    }
  }
}
