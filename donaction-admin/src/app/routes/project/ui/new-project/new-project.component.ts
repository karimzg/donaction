import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { DialogModule } from "primeng/dialog";
import { Router, RouterLink } from "@angular/router";
import { ProjectService } from "@shared/services/project.service";
import { CachingService } from "@shared/services/caching.service";
import { TmplProjectCategory, TmplProjectLibrary } from "@shared/utils/models/klubr";
import { concatWith, delay, map, shareReplay } from "rxjs/operators";
import { combineLatest, EMPTY, Observable, of } from "rxjs";
import { environment } from "@environments/environment";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { CommonModule } from "@angular/common";
import { ImageModule } from "primeng/image";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { PermissionsService } from "@shared/services/permissions.service";
import { TmplNbByLibraryPipe } from "../../pipes/tmpl-nb-by-library.pipe";
import { ApiListResult } from "@shared/utils/models/misc";
import { AccordionModule } from "primeng/accordion";
import { LottieComponent } from "ngx-lottie";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";

@Component({
  selector: 'app-new-project',
  imports: [
    CommonModule,
    DialogModule,
    RouterLink,
    ImageModule,
    MediaPipe,
    TmplNbByLibraryPipe,
    AccordionModule,
    LottieComponent,
    KlubInfosComponent,
  ],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss',
})
export class NewProjectComponent {
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private cachingService = inject(CachingService);
  public sharedFacade = inject(SharedFacade);
  public permissionService = inject(PermissionsService);
  public tmplLibraries$: Observable<Array<TmplProjectLibrary>>;
  public tmplLibrariesAffiliates$?: Observable<Array<TmplProjectLibrary>>;
  public categoryMode: WritableSignal<boolean> = signal<boolean>(false);
  public currentCategory: WritableSignal<TmplProjectCategory | undefined> = signal<TmplProjectCategory | undefined>(undefined);
  public standardsModelsKlubUuid = environment.klubrUuid;
  public isKlubr = computed(() => this.sharedFacade.profile()?.klubr.uuid === this.standardsModelsKlubUuid);
  public isLoaded$?: Observable<boolean>;

  public visible = true;

  constructor() {
    // get all project templates from klubr - "Modèles de projets standards"
    const sportType = this.isKlubr() ? null : this.sharedFacade.profile()?.klubr.sportType;
    const additionalQueryParams = `filters[$or][0][sportType][$null]=true` + (sportType ? `&filters[$or][1][sportType][$eq]=${sportType}` : '');
    this.tmplLibraries$ = this.cachingService.cacheObservable<ApiListResult<TmplProjectLibrary>>(`tmplLibrary-klubr-${sportType}`, this.projectService.getProjectTmplLibraries([this.standardsModelsKlubUuid], additionalQueryParams)).pipe(
      map((res) => res.data),
      shareReplay(1),
    );

    let obs1: Observable<Array<TmplProjectLibrary>> = EMPTY;
    let obs2: Observable<Array<TmplProjectLibrary>> = EMPTY;
    let hasAffiliates = false;
    if ((this.sharedFacade.profile()?.klubr?.klubrAffiliations?.length || 0) > 0) {
      hasAffiliates = true;
      // get all project templates from klub affiliates "Modèles de projets des Fédérations auquel le Klub est rattaché"
      obs1 =
        this.cachingService.cacheObservable<ApiListResult<TmplProjectLibrary>>(`tmplLibrary-${this.sharedFacade.profile()?.klubr?.slug}`,
          this.projectService.getProjectTmplLibraries(this.sharedFacade.profile()!.klubr!.klubrAffiliations.map((klubr) => klubr.uuid))).pipe(
          map((res) => res.data),
        );
    }
    if (!this.isKlubr() && (this.sharedFacade.profile()?.klubr?.template_projects_libraries?.length || 0) > 0) {
      hasAffiliates = true;
      const ownLibrariesUUids = this.sharedFacade.profile()!.klubr!.template_projects_libraries.map((lib) => lib.uuid);
      // get all project templates from klub librairies "Modèles de projets de la Fédération"
      obs2 =
        this.cachingService.cacheObservable<ApiListResult<TmplProjectLibrary>>(`tmplLibrary-own-${this.sharedFacade.profile()?.klubr?.slug}`,
          this.projectService.getOwnProjectTmplLibraries(ownLibrariesUUids)).pipe(
          map((res) => res.data),
        );
    }
    this.tmplLibrariesAffiliates$ = hasAffiliates ? obs1.pipe(
      concatWith(obs2),
      shareReplay(1),
    ) : of([]);
    this.isLoaded$ = combineLatest([this.tmplLibraries$, this.tmplLibrariesAffiliates$, of(true).pipe(delay(1000))]).pipe(
      map(([tmplLibraries, tmplLibrariesAffiliates]) => tmplLibraries.length > 0 || tmplLibrariesAffiliates.length > 0),
    );
  }

  openCategory(category: TmplProjectCategory) {
    this.currentCategory.set(category);
    this.categoryMode.set(true);
  }

  backToCategories() {
    this.categoryMode.set(false);
  }

  closeModal() {
    const currentUrl = this.router.url.split('/').slice(0, -1).filter((a) => a.length > 0);
    this.router.navigate(['/', ...currentUrl, {outlets: {modal: null}}]).then();
  }
}
