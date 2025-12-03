import { Component, inject, input, InputSignal, } from '@angular/core';
import { InputTextModule } from "primeng/inputtext";
import { ReactiveFormsModule } from "@angular/forms";
import { Button } from "primeng/button";
import { ProjectCardComponent } from "@shared/components/project/project-card/project-card.component";
import { KlubProject, Klubr, ProjectStatus } from "@shared/utils/models/klubr";
import { defaultProjectPopulate, defaultProjectSort, ProjectService } from "@shared/services/project.service";
import { DialogService } from "primeng/dynamicdialog";
import { ApiListResult } from "@shared/utils/models/misc";
import { Observable } from "rxjs";
import { RouterModule } from "@angular/router";
import { ProjectFilters } from "../../model/project-filters";
import { ProjectFiltersComponent } from "@app/routes/project/ui/project-filters/project-filters.component";
import { GenericListingComponent } from "@shared/components/generics/generic-listing/generic-listing.component";
import {
  ListLoadingNoResultsComponent
} from "@shared/components/lists/list-loading-no-results/list-loading-no-results.component";
import { ListHeaderComponent } from "@shared/components/lists/list-header/list-header.component";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { Location } from "@angular/common";
import { ScrollNearEndDirective } from "@shared/utils/Directives/scroll-near-end-directive.directive";

@Component({
  selector: 'app-project-listing',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    Button,
    ProjectCardComponent,
    RouterModule,
    ProjectFiltersComponent,
    ListLoadingNoResultsComponent,
    ListHeaderComponent,
    ScrollNearEndDirective,
  ],
  providers: [DialogService],
  templateUrl: './project-listing.component.html',
  styleUrl: './project-listing.component.scss',
  animations: [fadeAnimation]
})
export class ProjectListingComponent extends GenericListingComponent<KlubProject, ProjectFilters> {
  protected override incrementalPagination = true;

  /* SPECIFIC SERVICES */
  private projectService = inject(ProjectService);
  private location = inject(Location);

  /* SPECIFIC VARS */
  public klubrInit: InputSignal<Klubr | undefined> = input<Klubr | undefined>(undefined);
  public projectStatusInit: InputSignal<Array<ProjectStatus> | undefined> = input<Array<ProjectStatus> | undefined>(undefined);

  ngOnInit() {
    const urlWithoutQueryParam = this.location.path().split('?')[0];
    this.location.replaceState(urlWithoutQueryParam);

    /* SET INPUT FILTERS */
    this.setInputFilters();
  }

  setInputFilters(): void {
    const filters: { [key: string]: Array<string | null> } = {};
    if (this.klubrInit()?.uuid) {
      filters['klubrUUIDs'] = [this.klubrInit()!.uuid!];
    }
    if (this.projectStatusInit()) {
      filters['status'] = this.projectStatusInit()!;
    }
    if (Object.keys(filters).length) {
      this.filtersList.set(filters);
    }
  }

  /* OVERRIDED METHODS */
  protected override requestListWithFilters(klubUuid?: string | null, filters?: ProjectFilters, page = 1): Observable<ApiListResult<KlubProject>> {
    filters = filters || {};
    if (klubUuid) {
      filters.klubrUUIDs = [klubUuid];
    }
    return this.projectService.getProjectsWithFilters(filters, defaultProjectPopulate, undefined, defaultProjectSort, page);
  }
}
