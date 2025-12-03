import { booleanAttribute, Component, inject, input, model, viewChild, ViewEncapsulation } from '@angular/core';
import { Badge } from "primeng/badge";
import { Button } from "primeng/button";
import { NbNotNullPipe } from "@shared/pipes/misc/nb-not-null.pipe";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ListingFilters } from "@shared/utils/models/misc";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime } from "rxjs/operators";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { DeviceService } from "@shared/services/device.service";
import { Drawer, DrawerModule } from "primeng/drawer";
import { NgTemplateOutlet } from "@angular/common";

@Component({
  selector: 'app-list-header',
  imports: [
    Badge,
    Button,
    NbNotNullPipe,
    ReactiveFormsModule,
    InputTextModule,
    IconField,
    InputIcon,
    DrawerModule,
    NgTemplateOutlet,
  ],
  template: `
    <div class="bg-[#F8FAFC] w-full py-3 md:px-3 px-3 border-solid border border-[#E2E8F0] mb-5">
      <div class="flex gap-3 justify-between">
        @if (displaySearch()) {
          <form [formGroup]="form" class="grow-0 shrink basis-[550px] ">
            <p-iconfield iconPosition="left" class="w-full">
              <p-inputicon styleClass="pi pi-search"/>
              <input #firstInput type="text" pInputText formControlName="searchParams" class="w-full"
                     placeholder="{{searchPlaceholder()}}"/>
            </p-iconfield>
          </form>
        }
        <div class="grow shrink-0 basis-auto flex md:w-auto gap-3 justify-end">
          <ng-content select="[tmplHeaderActions]"></ng-content>
          @if (displayFilters()) {
            <div class="relative">
              @if (filtersList()) {
                @if (filtersList()! | nbNotNull; as nbFilters) {
                  <p-badge class="absolute right-[-6px] top-[-6px] z-10" [value]="nbFilters"
                           severity="success"/>
                }
              }
              <p-button (click)="toggleFilters()"
                        class="self-end p-button--only-icon-mobile"
                        icon="pi pi-filter"
                        label="Filtres"
                        [severity]="showFilters() ? 'primary' : 'contrast'">
              </p-button>
            </div>
          }
        </div>
      </div>
      @if (deviceService.isDesktop()) {
        <div [hidden]="!showFilters()">
          <ng-container *ngTemplateOutlet="content"></ng-container>
        </div>
      } @else {
        <p-drawer #drawerRef [(visible)]="showFilters" position="bottom" [style]="{'height': 'auto'}"
                  transitionOptions="250ms cubic-bezier(0, 0, 0.2, 1)"
                  styleClass="filters-drawer-bottom">
          <ng-template #headless>
            <ng-container *ngTemplateOutlet="content"></ng-container>
          </ng-template>
        </p-drawer>
      }
      <ng-template #content>
        <ng-content></ng-content>
      </ng-template>
    </div>
  `,
  styles: [`
    app-list-header {
      display: block;
      position: sticky;
      top: 8rem;
      z-index: 12;
    }

    @media (max-width: 767px) {
      app-list-header {
        margin: 0 -1rem;
      }
    }

    .p-drawer.filters-drawer-bottom {
      background: transparent;
      border: none;

      & > * {
        & > div {
          margin-top: 0 !important;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }

        form {
          & > div:last-child {
            width: 100%;
            justify-content: space-between;
          }
        }
      }
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class ListHeaderComponent {
  public deviceService = inject(DeviceService);
  public showFilters = model<boolean>(false);
  public displayFilters = input(true, {transform: booleanAttribute});
  public filtersList = input<ListingFilters | undefined>(undefined);
  public displaySearch = input(false, {transform: booleanAttribute});
  public searchPlaceholder = input<string>('Rechercher');
  public filtersSearch = model<ListingFilters>();

  public drawerRef = viewChild<Drawer>('drawerRef');

  public form: FormGroup = new FormGroup({
    searchParams: new FormControl(''),
  });

  constructor() {
    this.form.get('searchParams')?.valueChanges.pipe(
      takeUntilDestroyed(),
      debounceTime(300),
    ).subscribe((value) => {
      const newFilters = {...this.filtersSearch(), ...{searchParams: value || undefined}} as ListingFilters;
      this.filtersSearch.set(newFilters);
    });
  }

  toggleFilters() {
    this.showFilters.update((val) => !val);
  }

  closeDrawer() {
    this.drawerRef() && this.drawerRef()!.close(new Event('click'));
  }

}
