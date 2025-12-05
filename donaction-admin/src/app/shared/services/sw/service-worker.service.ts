import { ApplicationRef, computed, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SwPush, SwUpdate, VersionReadyEvent } from "@angular/service-worker";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";
import { MainMessageService } from "@shared/services/misc/main-message.service";
import { concat, filter, first, interval, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {
  private swUpdate = inject(SwUpdate);
  private confirmDialogWrapperService = inject(ConfirmDialogWrapperService);
  private mms = inject(MainMessageService);
  private appRef = inject(ApplicationRef);
  private swUpdates = inject(SwUpdate);
  private swPush = inject(SwPush);

  private deferredPrompt: WritableSignal<any> = signal(undefined);

  constructor() {
    console.log('>>ServiceWorkerService constructor');
    // Prevent install prompt
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      console.log('>>beforeinstallprompt AFTER preventDefault', event);
      this.deferredPrompt.set(event); // Sauvegarder l'événement
      console.log('>>beforeinstallprompt this.deferredPrompt', this.deferredPrompt());
    });
    // Detect app install
    window.addEventListener('appinstalled', () => {
      console.log('Application installée');
      localStorage.setItem('appKlubrIsInstalled', 'true'); // Sauvegarder l'état d'installation
    });
    effect(() => {
      if (this.canInstall()) {
        console.log('>>ServiceWorkerService effect');
        const msg = `Vous utilisez Klubr Admin en mode web.<br>L'<strong>application mobile</strong> vous offre des fonctionnalités plus poussées <i>(notifications de réception de dons, performances...)</i>. <br>Souhaitez-vous l'installer?`;
        this.mms.addMessage(msg, {
          type: 'info',
          actionIcon: 'pi-download',
          actionID: 'installPwa',
          memberRestriction: 'Admin'
        });
        console.log('>>ServiceWorkerService effect Msg displayed');
      }
    });
  }

  /* PWA Install */

  // Méthode pour déclencher l'installation
  public installPwa(): void {
    console.log('>>beforeinstallprompt > installPwa');
    if (this.deferredPrompt()) {
      console.log('>>beforeinstallprompt > installPwa B');
      this.deferredPrompt().prompt();
      this.deferredPrompt().userChoice.then((outcome: any) => {
        this.deferredPrompt.set(null); // Réinitialiser après l'installation
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt.');
          const msg = `Très bon choix!<br>Vous pouvez quitter cette page et utilisez dès maintenant Klubr Admin depuis l'<strong>application mobile</strong>`;
          this.mms.addMessage(msg, {type: 'info'});
        } else if (outcome === 'dismissed') {
          console.log('User dismissed the install prompt');
        }
      });
    }
  }

  // Vérifier si l'événement est disponible
  public canInstall = computed(() => {
    console.log('>>beforeinstallprompt > canInstall A', this.deferredPrompt());
    const can = (!!this.deferredPrompt());
    console.log('>>beforeinstallprompt > canInstall B return ', can);
    return can;
  });

  isAppAlreadyInstalled(): boolean {
    return localStorage.getItem('isAppInstalled') === 'true';
  }

  /* SW Updates */
  initCheckForUpdates(intervalInHours: number) {
    // Allow the app to stabilize first, before starting
    // polling for updates with `interval()`.
    console.log('CheckForUpdateService');
    const appIsStable$ = this.appRef.isStable.pipe(first((isStable) => isStable));
    const everySixHours$ = interval(intervalInHours * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await this.swUpdates.checkForUpdate();
        console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }

  initVersionUpdateTracker() {
    console.log('PromptUpdateService ');
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
          this.confirmDialogWrapperService.confirm({
            message: `Une nouvelle version est disponible. Voulez-vous l’actualiser ?`,
            header: `Nouvelle version`,
            acceptLabel: 'Recharger la page',
            accept: () => {
              window.location.reload();
            },
            reject: () => {
              this.mms.addMessage(`Une nouvelle version est disponible. Pour en bénéficier, rechargez la page en cliquant ici:`,
                {type: 'warn', action: () => window.location.reload(), actionIcon: 'pi-refresh'});
            }
          });
        }
      );
  }

  /* MEDIA VERSION */
  isStandalone(): boolean {
    // Check for iOS & Android
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  }

  getDisplayMode(): string {
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'minimal-ui';
    } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    } else if (navigator.userAgent.includes('Electron')) {
      return 'electron'; // Si vous utilisez Electron pour Desktop.
    } else if ((navigator as any).standalone === true) {
      return 'standalone (iOS)';
    } else {
      return 'browser';
    }
  }

  /* PUSH */
  pushSubscription() {
    if (!this.swPush.isEnabled) {
      console.log('Push notifications are not enabled');
      return;
    }
    this.swPush.requestSubscription({
      serverPublicKey: 'BF-U2dqDYi-tXNQ5rJ-ewiebSS72Z4AOoL8b1YMGC291x3gWvQiZ8njwDslQ-9Gt_IWOCLg3pvyhOG-yzUvTah0'
    })
      .then(sub => {
        // TODO: Make a POST request to send the subscription to the server
        console.log('Subscribed to push notifications', JSON.stringify(sub))
      })
      .catch(err => console.error('Could not subscribe to push notifications', err));
  }

  getSwMessages(): Observable<Notification> {
    return this.swPush.messages.pipe(
      map((message) => message as { notification: Notification }),
      map(({notification}) => notification),
    );
  }

  getSwNotificationClick(action?: NotificationActionType): Observable<{
    action: NotificationActionType,
    notification: Notification
  }> {
    return this.swPush.notificationClicks.pipe(
      filter(({action: a}) => !action || a === action),
      map(({action, notification}) => ({action, notification}) as {
        action: NotificationActionType,
        notification: Notification
      })
    );
  }
}

export type NotificationActionType = 'close' | 'open' | 'action' | 'myAction';

export interface NotificationAction {
  action: NotificationActionType;
  title: string;
  icon?: string;
  type?: 'default' | 'button' | 'menu';
  placeholder?: string;
}

export interface Notification {
  actions?: Array<NotificationAction>;
  badge?: string;
  body?: string;
  data?: {
    url?: 'https?://www.gstatic.com',
    message?: 'Don recu de 1000€!',
    [key: string]: any;
  },
  dir?: 'ltr' | 'rtl' | 'auto';
  icon?: string;
  image?: string;
  lang?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: Date;
  title?: string;
  vibrate?: Array<number>;
}
