import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { ImageModule } from "primeng/image";
import { NavigationEnd, Router, RouterModule, RouterOutlet, } from "@angular/router";
import { TabsModule } from "primeng/tabs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";
import { tap } from "rxjs/operators";
import { fadeAnimation } from "@shared/utils/animations/animations";

@Component({
  selector: 'app-don-balance',
  imports: [
    TabsModule,
    ImageModule,
    RouterOutlet,
    RouterModule,
  ],
  providers: [],
  templateUrl: './don-balance.component.html',
  styleUrl: './don-balance.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation]
})
export class DonBalanceComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  activeUrl: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  constructor() {
    this.activeUrl.set(this.router.url);
    this.router.events.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      tap((a) => console.log('router event', a)),
    ).subscribe({
      next: (event: NavigationEnd) => this.activeUrl.set(event.url)
    });
  }
}
