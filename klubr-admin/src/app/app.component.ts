import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ToastService } from "@shared/services/misc/toast.service";
import { AnalyticsService } from "@shared/services/analytics/analytics.service";
import { ConfirmDialogComponent } from "@shared/components/dialog/confirm-dialog/confirm-dialog.component";
import { LogUpdateService } from "@shared/services/sw/log-update.service";
import { version } from "@environments/version";
import { environment } from "@environments/environment";
import { ServiceWorkerService } from "@shared/services/sw/service-worker.service";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ToastService]
})
export class AppComponent {
  router = inject(Router);
  toastService = inject(ToastService);
  analyticsService = inject(AnalyticsService);
  SWService = inject(ServiceWorkerService);
  logUpdateService = inject(LogUpdateService);
  title = 'klubr-admin';

  constructor() {
    console.log('AppComponent VERSION', version);
    this.analyticsService.init();
    if (environment.pwaEnabled) {
      this.SWService.initCheckForUpdates(6);
      this.SWService.initVersionUpdateTracker();
      this.logUpdateService.init();
      // this.notificationsService.setBadge(5);
    }
  }
}



