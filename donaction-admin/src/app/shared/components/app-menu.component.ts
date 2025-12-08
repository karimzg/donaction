import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  Signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuService } from '../services/menu.service';
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { PermissionsService } from "../services/permissions.service";
import { KlubInfosCompletionComponent } from "./klub/klub-infos-completion/klub-infos-completion.component";
import { NgClass } from "@angular/common";

@Component({
  imports: [
    RouterModule,
    KlubInfosCompletionComponent,
    NgClass,
  ],
  selector: '[app-menuitem]',
  template: `
    @if (!item['isAdmin'] || (item['isAdmin'] && isAdmin())) {
      @if (root && item.visible !== false) {
        <div class="layout-menuitem-root-text">{{ item.label }}</div>
      }
      @if ((!item.routerLink || item.items) && item.visible !== false) {
        <a [attr.href]="item.url"
           (click)="itemClick($event)"
           [ngClass]="{'disabled-link': item.disabled || isDisabled()}" [attr.target]="item.target" tabindex="0"
           pRipple>
          <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
          <span class="layout-menuitem-text">{{ item.label }}</span>
          @if (item.items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }
      @if ((item.routerLink && !item.items) && item.visible !== false) {
        <a (click)="itemClick($event)"
           [ngClass]="{'disabled-link': item.disabled || isDisabled()}"
           [routerLink]="item.routerLink" routerLinkActive="active-route"
           [routerLinkActiveOptions]="item.routerLinkActiveOptions||{ paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
           [fragment]="item.fragment" [queryParamsHandling]="item.queryParamsHandling"
           [preserveFragment]="item.preserveFragment"
           [skipLocationChange]="item.skipLocationChange" [replaceUrl]="item.replaceUrl" [state]="item.state"
           [queryParams]="item.queryParams"
           [attr.target]="item.target" tabindex="0" pRipple>
          <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
          <span class="layout-menuitem-text flex-1">{{ item.label }}</span>
          @if (item.progress >= 0) {
            <app-klub-infos-completion [progress]="item.progress" label=""></app-klub-infos-completion>
          }
          @if (item.items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }
      @if (item.items && item.visible !== false) {
        <ul [@children]="submenuAnimation">
          @for (child of item.items; let i = $index; track child.label) {
            <li app-menuitem [item]="child" [parentKey]="key" [index]="i" [class]="child.badgeClass"
                [isDisabled]="isDisabled()"></li>
          }
        </ul>
      }
    }
  `,
  styles: [`
    .disabled-link {
      pointer-events: none;
      opacity: 0.9;
    }
  `],
  animations: [
    trigger('children', [
      state('collapsed', style({
        height: '0'
      })),
      state('expanded', style({
        height: '*'
      })),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMenuitemComponent implements OnInit, OnDestroy {
  router = inject(Router);
  menuService = inject(MenuService);
  permissionsService = inject(PermissionsService);

  @Input() item: any;

  @Input() index!: number;

  @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;

  @Input() parentKey!: string;

  @Input() progress?: number;

  public isDisabled = input(false);

  active = false;

  menuSourceSubscription: Subscription;

  menuResetSubscription: Subscription;

  key: string = "";

  public isAdmin: Signal<boolean | undefined> = toSignal(this.permissionsService.isAdmin$);

  constructor() {
    this.menuSourceSubscription = this.menuService.menuSource$.subscribe((value: any) => {
      Promise.resolve(null).then(() => {
        if (value.routeEvent) {
          this.active = (value.key === this.key || value.key.startsWith(this.key + '-')) ? true : false;
        } else {
          if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
            this.active = false;
          }
        }
      });
    });

    this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
      this.active = false;
    });

    this.router.events.pipe(
      takeUntilDestroyed(),
      filter(event => event instanceof NavigationEnd),
    ).subscribe(params => {
      if (this.item.routerLink) {
        this.updateActiveStateFromRoute();
      }
    });
  }

  ngOnInit() {
    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

    if (this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }
  }

  updateActiveStateFromRoute() {
    let activeRoute = this.router.isActive(this.item.routerLink[0], {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored'
    });

    if (activeRoute) {
      this.menuService.onMenuStateChange({key: this.key, routeEvent: true});
    }
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item.disabled || this.isDisabled()) {
      event.preventDefault();
      return;
    }

    // execute command
    if (this.item.command) {
      this.item.command({originalEvent: event, item: this.item});
    }

    // toggle active state
    if (this.item.items) {
      this.active = !this.active;
    }

    this.menuService.onMenuStateChange({key: this.key});
  }

  get submenuAnimation() {
    return this.root ? 'expanded' : (this.active ? 'expanded' : 'collapsed');
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.active && !this.root;
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}
