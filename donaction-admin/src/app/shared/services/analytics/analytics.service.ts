import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from "@angular/router";
import { ToastService } from "@shared/services/misc/toast.service";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import Plausible from "plausible-tracker";
import { environment } from "@environments/environment";
import { combineLatest, filter } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { tap } from "rxjs/operators";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { Location } from "@angular/common";
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private sharedFacade = inject(SharedFacade);
  private location = inject(Location);
  private cookieService = inject(CookieService);

  private plausible = environment.enableAnalytics ? Plausible({
    domain: environment.plausibleDomain,
    trackLocalhost: (environment.env === 'dev') && this.cookieService.get('plausibleTraskLocalhost') === 'true',
  }) : undefined;

  init() {
    if (environment.enableAnalytics) {
      combineLatest([
        this.router.events.pipe(
          takeUntilDestroyed(),
          filter(event => event instanceof NavigationEnd),
          tap(() => this.navigationEndHook()),
        ),
        this.sharedFacade.profile$.pipe(
          filter(profile => !!profile),
        )
      ]).pipe(
        takeUntilDestroyed(),
      ).subscribe({
        next: ([, profile]) => {
          this.trackPageview({profile});
        }
      });
    }
  }

  public trackPageview(options: { customUrl?: string, profile?: KlubrMembre | null } = {}) {
    const profile = options.profile || this.sharedFacade.profile();
    if (!profile) {
      return;
    }
    const currentUrl = environment.baseUrl + this.location.path();
    // TODO: check that this is the correct way to handle customUrl
    const optionsData = options.customUrl ? {url: currentUrl + options.customUrl} : {};
    this.plausible?.trackPageview(
      optionsData,
      {
        props: {
          Profile: `${profile.klubr?.acronyme} - ${profile.klubr?.denomination} - ${profile.role} (${profile.uuid})`,
        }
      }
    )
  }

  public trackEvent(eventName: AnalyticsEvent, options: {
    customUrl?: string,
    profile?: KlubrMembre | null,
    customProps?: { [key in AnalyticsProps]?: any }
  } = {}) {
    const profile = options.profile || this.sharedFacade.profile();
    if (!profile) {
      return;
    }
    this.plausible?.trackEvent(
      eventName,
      {
        props: {
          Profile: `${profile.klubr?.acronyme} - ${profile.klubr?.denomination} - ${profile.role} (${profile.uuid})`,
          ...options.customProps,
        }
      }
    )
  }

  private navigationEndHook() {
    this.toastService.clearAllToasts()
  }

}

export type AnalyticsEvent =
  'Error' |
  'Submit' |
  'FileEvent' |
  'ToogleKlubState' |
  'LinkProfile'
  ;
export type AnalyticsProps =
  'Action' |
  'Profile'
  ;

