import { Component, inject, signal } from '@angular/core';
import { LogUpdateService } from "@shared/services/sw/log-update.service";
import { NotificationsService } from "@shared/services/sw/notifications.service";
import { ButtonDirective } from "primeng/button";
import { version } from "@environments/version";
import { NotificationAction, ServiceWorkerService } from "@shared/services/sw/service-worker.service";
import { MainMessageService } from "@shared/services/misc/main-message.service";

@Component({
  selector: 'app-pwa-sandbox',
  imports: [
    ButtonDirective
  ],
  templateUrl: './pwa-sandbox.component.html',
  styleUrl: './pwa-sandbox.component.scss'
})
export class PwaSandboxComponent {
  public logUpdateService = inject(LogUpdateService);
  private notificationsService = inject(NotificationsService);
  public SWService = inject(ServiceWorkerService);
  public mms = inject(MainMessageService);
  badgeCpt = signal(0);
  version = version;

  constructor() {
    this.SWService.getSwMessages().subscribe((notification) => {
      this.mms.addMessage(notification?.data?.message || 'nouveau message inconnu', {type: 'info'});
      console.log('SW Message', notification);
    });
    this.SWService.getSwNotificationClick('myAction').subscribe(({action, notification}) => {
      this.mms.addMessage(notification?.actions?.find((a: NotificationAction) => a.action === 'myAction')?.title || 'nouveau message inconnu', {type: 'info'});
      console.log('SW Notification Click', action, notification);
    });
  }

  testBadges() {
    this.badgeCpt.update((c) => c + 1);
    this.notificationsService.setBadge(this.badgeCpt());
  }

  pushSubscription() {
    this.SWService.pushSubscription();
  }
}
