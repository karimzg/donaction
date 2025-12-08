import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  NoNewVersionDetectedEvent,
  SwUpdate,
  VersionDetectedEvent,
  VersionInstallationFailedEvent,
  VersionReadyEvent
} from "@angular/service-worker";
import { distinctUntilChanged, tap } from "rxjs/operators";
import { toSignal } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class LogUpdateService {
  private updates = inject(SwUpdate);
  public versionState =
    toSignal(this.updates.versionUpdates.pipe(
      distinctUntilChanged((prev, curr) => prev.type === curr.type))
    );
  public versionStateMsg = computed<string>(() => {
    if (this.versionState()) {
      // check if the versionState is of type VersionDetectedEvent
      if (this.versionState()!.type === 'VERSION_DETECTED') {
        return `Downloading new app version: ${(this.versionState() as VersionDetectedEvent).version.hash}`;
      } else if (this.versionState()!.type === 'VERSION_READY') {
        const versionState = this.versionState() as VersionReadyEvent;
        return `Current app version: ${versionState.currentVersion.hash}\nNew app version ready for use: ${versionState.latestVersion.hash}`;
      } else if (this.versionState()!.type === 'VERSION_INSTALLATION_FAILED') {
        const versionState = this.versionState() as VersionInstallationFailedEvent;
        return `Failed to install app version '${versionState.version.hash}': ${versionState.error}`;
      } else if (this.versionState()!.type === 'NO_NEW_VERSION_DETECTED') {
        return `No new version detected`;
      }
    }
    return 'No STATE';

  });
  // public messages = linkedSignal<string, Array<string>>({
  //     source: this.versionStateMsg,
  //     computation: (msg: string) => {
  //         return untracked(() => {
  //             const msgs = this.messages() as Array<string>;
  //             msgs.push(msg);
  //             return msgs;
  //         });
  //     },
  // });
  public versionStateCurrentVersion = computed(() => {
    if (this.versionState()) {
      if (this.versionState()!.type === 'VERSION_READY') {
        return (this.versionState() as VersionReadyEvent).currentVersion.hash;
      } else if (this.versionState()!.type === 'VERSION_DETECTED') {
        return (this.versionState() as VersionDetectedEvent).version.hash;
      } else if (this.versionState()!.type === 'VERSION_INSTALLATION_FAILED') {
        return (this.versionState() as VersionInstallationFailedEvent).version.hash;
      } else if (this.versionState()!.type === 'NO_NEW_VERSION_DETECTED') {
        return (this.versionState() as NoNewVersionDetectedEvent).version.hash;
      }
    }
    return 'No VERSION';
  });
  public messages = signal<string[]>([]);

  constructor() {
    effect(() => {
      this.messages.update((msgs) => [...msgs, this.versionStateMsg()]);
    });
  }

  init() {
    console.log('LogUpdateService', this.updates.isEnabled);
    this.updates.versionUpdates.pipe(
      tap((evt) => console.log('LogUpdateService > event', evt)),
    ).subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
      }
    });
  }
}
