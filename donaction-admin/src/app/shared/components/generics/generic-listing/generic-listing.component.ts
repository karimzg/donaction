import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  signal,
  untracked,
  viewChild,
  WritableSignal
} from '@angular/core';
import { ApiListResult, EntityModel, ListingFilters, MetaPagination } from "@shared/utils/models/misc";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { PermissionsService } from "@shared/services/permissions.service";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { FormControl, FormGroup } from "@angular/forms";
import { EMPTY, Observable } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { tap } from "rxjs/operators";
import { GenericFiltersComponent } from "@shared/components/generics/generic-filters/generic-filters.component";

@Component({
  selector: 'app-generic-listing',
  template: ``,
  imports: [],
})
export class GenericListingComponent<T extends EntityModel, F extends ListingFilters> implements AfterViewInit {
  public sharedFacade = inject(SharedFacade);
  public permissionsService = inject(PermissionsService);

  public listing: WritableSignal<Array<T>> = signal([]);
  public profile: Signal<KlubrMembre | null> = this.sharedFacade.profile;
  public pagination: WritableSignal<MetaPagination | undefined> = signal(undefined);
  public page: WritableSignal<number> = signal(1);
  public pageSize: WritableSignal<number> = signal(20);
  public klubrUuid: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
  public filtersSearch: WritableSignal<F | undefined> = signal(undefined);
  private _filters: Signal<F | undefined> = computed(() => {
    return {
      ...this.filtersList(),
      ...this.filtersSearch(),
    } as F;
  });
  public hasFilters = computed(() => {
    const filters = this._filters();
    // If member is not admin, filters are at least filled with the klubrUuid
    return (filters && typeof filters === 'object' && Object.keys(filters).length > (this.permissionsService.memberIsAdmin(untracked(this.profile)!) ? 0 : 1)); // || (this.permissionsService.memberIsAdmin(this.profile()!) && this.klubrUuid());
  });
  public filtersList: WritableSignal<F | undefined> = signal(undefined);

  public form: FormGroup = new FormGroup({
    searchParams: new FormControl(''),
  });

  protected incrementalPagination = false;

  firstInput = viewChild<ElementRef>('firstInput');
  filtersComponent = viewChild<GenericFiltersComponent<F>>('filtersComponent');

  constructor() {
    this.sharedFacade.profile$.pipe(
      takeUntilDestroyed(),
      tap(() => {
        untracked(this.filtersComponent)?.resetFilters(false);
        this.klubrUuid.set(this.permissionsService.memberIsAdmin(untracked(this.profile)!) ? '' : untracked(this.profile)!.klubr.uuid);
      }),
    ).subscribe();

    effect(() => {
      if (this._filters()) {
        this.onFiltersChanged();
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.firstInput()?.nativeElement) {
      this.firstInput()!.nativeElement.focus();
    }
  }

  public onFiltersChanged(page = 1): void {
    this.setQueryData(untracked(this.klubrUuid), this._filters(), page);
  }

  public onNearEndScroll() {
    if (this.pagination() && this.pagination()!.page < (this.pagination()?.pageCount || 0) && !this.sharedFacade.loading()) {
      this.onFiltersChanged(this.pagination()!.page + 1);
    }
  }

  private setQueryData(klubUuid?: string | null, filters?: F, page = 1): void {
    this.sharedFacade.setLoading(true);
    this.requestListWithFilters(klubUuid, filters, page).subscribe({
      next: (data: ApiListResult<T>) => {
        this.listing.set(this.incrementalPagination
          ? data.meta.pagination.page === 1 ? data.data : [...untracked(this.listing), ...data.data]
          : data.data
        );
        this.pagination.set(data.meta.pagination);
      },
      complete: () => {
        this.sharedFacade.setLoading(false);
      },
      error: (error) => {
        this.sharedFacade.setLoading(false);
      },
    });
  }

  protected requestListWithFilters(klubUuid?: string | null, filters?: F, page = 1): Observable<ApiListResult<T>> {
    return EMPTY;
  }

  nextPage(page: number) {
    this.onFiltersChanged(page);
  }

  changePage(event: any) {
    this.page.set(event.page + 1);
    this.pageSize.set(event.rows);
    this.onFiltersChanged(event.page + 1);
  }

}
