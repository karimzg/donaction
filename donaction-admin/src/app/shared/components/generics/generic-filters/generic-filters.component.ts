import { Component, inject, output } from '@angular/core';
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { ListingFilters } from "@shared/utils/models/misc";
import { PermissionsService } from "@shared/services/permissions.service";
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'app-generic-filters',
  imports: [],
  template: ``,
})
export class GenericFiltersComponent<F extends ListingFilters> {
  public sharedFacade = inject(SharedFacade);
  public permissionsService = inject(PermissionsService);

  public filtersForm: FormGroup = new FormGroup({});

  filtersChanged = output<F>();

  klubrUUIDs: string[] = [];

  ngOnInit(): void {
    this.initFormAndMarkAsPristine();
  }

  setKlub(event: string) {
    this.klubrUUIDs = event ? [event] : [];
    this.hookOnUpdateKlubrUUIDs();
  }

  protected hookOnUpdateKlubrUUIDs(): void {
  }

  protected initForm(): void {
  }

  protected initFormAndMarkAsPristine(): void {
    this.initForm();
    this.filtersForm.markAsPristine();
  }

  protected updateListOfFilters(): F {
    return this.filtersForm.value as F;
  }

  protected resetListOfFilters(): F {
    this.filtersForm.reset();
    this.filtersForm.markAsPristine();
    return this.filtersForm.value as F;
  }

  protected resetFiltersFields(): void {
  }

  applyFilters() {
    let listOfFilters: F = this.updateListOfFilters();
    this.filtersChanged.emit(listOfFilters);
  }

  resetFilters(noEmit = false) {
    this.klubrUUIDs = [];
    this.resetFiltersFields();
    let listOfFilters: F = this.resetListOfFilters();
    if (!noEmit) {
      this.filtersChanged.emit(listOfFilters);
    }
  }
}
