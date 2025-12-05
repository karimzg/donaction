import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  model,
  signal,
  viewChild,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { InvalidateCacheService } from "@shared/services/invalidate-cache.service";
import { PermissionsService } from "@shared/services/permissions.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, of, skip } from "rxjs";
import { FormGroup } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, delay, switchMap, tap } from "rxjs/operators";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { EntityModel } from "@shared/utils/models/misc";
import { ToastService } from "@shared/services/misc/toast.service";
import { AnalyticsService } from "@shared/services/analytics/analytics.service";

@Component({
  selector: 'app-generic-update',
  imports: [],
  template: ``
})
export class GenericUpdateComponent<T extends EntityModel> implements AfterViewInit {
  // SERVICES
  protected sharedFacade = inject(SharedFacade);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected toastService = inject(ToastService);
  protected analyticsService = inject(AnalyticsService);
  public invalidateCacheService = inject(InvalidateCacheService);
  public permissionsService = inject(PermissionsService);

  // MESSAGES
  protected successMsg = 'Mise à jour réussie';
  protected errorUpdateMsg = 'Un problème est survenu lors de la mise à jour';
  protected errorCreateMsg = 'Un problème est survenu lors de la création';
  protected routePrefix = '/';
  protected subFormToUpdate?: string;

  // FORM
  public entityForm: FormGroup = new FormGroup({});

  // FORM STATES
  public editMode: boolean = true;
  public isSubmitted: WritableSignal<boolean> = signal<boolean>(false);
  public loading: WritableSignal<boolean> = signal<boolean>(false);
  public isReady: WritableSignal<boolean> = signal<boolean>(false);

  // ENTITY
  public entitySignal: WritableSignal<T | null> = signal<T | null>(null);
  // INPUT ENTITY (from component input or route data)
  public entity = model<T | null>(null, {alias: 'entity'});

  @ViewChild('firstInput') firstInput!: ElementRef;

  // ANALYTICS PROPERTIES
  firstHeading = viewChild<ElementRef>('title');
  customAnalyticsProps?: string;

  constructor() {
    effect(() => {
      let entity: T | null = this.entity();
      if (entity !== undefined) {
        this.setEditMode(entity);

        // >>> Init entitySignal EDIT MODE
        if (!this.editMode) {
          entity = this.getEntityForCreateMode(entity);
        }
        // >>> Init entitySignal EDIT MODE
        this.entitySignal.set(entity);
        this.initForm();
        this.isReady.set(true);
      }
    });
    // Reload route when profile changes in order to update permissions (via resolver)
    this.reloadCurrentRouteOnProfileChange();
  }

  ngAfterViewInit(): void {
    if (this.firstInput?.nativeElement) {
      this.firstInput.nativeElement.focus();
    }
  }

  protected reloadCurrentRouteOnProfileChange() {
    this.sharedFacade.profileChanged$.pipe(
      skip(1),
      takeUntilDestroyed(),
    ).subscribe({
      next: (profile: KlubrMembre | null) => {
        if (profile) {
          this.reloadCurrentRoute();
        }
      }
    });
  }

  protected reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentUrl]).then();
    });
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }

  /* METHODS TO OVERRIDE */
  protected initForm(): void {
    this.entityForm = new FormGroup({});
    this.entityForm.updateValueAndValidity();
  }

  public resetForm(): void {
    this.entityForm.patchValue({});
    this.entityForm.markAsPristine();
  }

  protected setEditMode(entity: T | null): void {
    this.editMode = !!entity;
  }

  protected getEntityForCreateMode(entity: T | null): T | null {
    return entity;
  }

  protected formFields(publish = false): { [key: string]: any } {
    return {};
  }

  protected updateSubFormsValueAndValidity(): void {
  }

  protected cleanFormValues(formValues: { [key: string]: any }, form: FormGroup): { [key: string]: any } {
    const cleanedFormValues: { [key: string]: any } = {};
    Object.keys(formValues).forEach((key) => {
      if (form.get(key)?.dirty) {
        cleanedFormValues[key] = formValues[key];
      }
    });
    return cleanedFormValues;
  }

  // protected cleanFormValuesReccursive(formValues: { [key: string]: any }, form: FormGroup): { [key: string]: any } {
  //   const cleanedFormValues: { [key: string]: any } = {};
  //   Object.keys(formValues).forEach((key) => {
  //     console.log('key', key);
  //     if (form.get(key) instanceof FormGroup) {
  //       console.log('formValues[key]', formValues[key]);
  //       cleanedFormValues[key] = this.cleanFormValuesReccursive(formValues[key], form.get(key) as FormGroup);
  //     } else {
  //       console.log('form.get(key)', form.get(key));
  //       if (form.get(key)?.dirty) {
  //         cleanedFormValues[key] = formValues[key];
  //       }
  //     }
  //
  //   });
  //   console.log('cleanedFormValues', cleanedFormValues);
  //   return cleanedFormValues;
  // }

  protected markSubFormsAsPristine(): void {

  }

  protected pathsToUnvalidateDataRequest(entity: T): string[] {
    return [];
  }

  protected cacheToUnvalidate(entity: T): void {
  }

  protected preUpdateHook(formValues: { [key: string]: any }): { [key: string]: any } {
    return formValues;
  }

  protected preCreateHook(formValues: { [key: string]: any }): { [key: string]: any } {
    return formValues;
  }

  protected serviceUpdate(uuid: string, formValues: any): Observable<T> {
    return of(formValues as T);
  }

  protected serviceCreate(formValues: any): Observable<T> {
    return of(formValues as T);
  }

  protected updateFile(entity: T): Observable<T> {
    return of(entity);
  }

  protected reloadEntity(entity: T): Observable<T> {
    // Necessary to override this method, when entity has strapi component
    return of(entity);
  }

  protected redirectAfterCreate(entity: T): void {
    this.router.navigate([this.routePrefix, entity!.uuid, 'update']);
  }

  protected redirectAfterUpdate(entity: T): void {
  }

  protected setCustomAnalyticsProps(): void {
  }

  public openPreview() {
  }

  /* GENERIC METHODS */
  private updateEntity(formValues: any): Observable<T> {
    formValues = (!this.editMode) ? this.preCreateHook(formValues) : this.preUpdateHook(formValues);
    const errorMsg = this.editMode ? this.errorUpdateMsg : this.errorCreateMsg;
    const req$ = this.editMode
      ? this.serviceUpdate(this.entitySignal()!.uuid, formValues)
      : this.serviceCreate(formValues).pipe(tap((entityCreated) => this.entitySignal.update((entity) => ({
        ...entity,
        uuid: entityCreated.uuid
      } as T))));
    return req$.pipe(
      catchError((error) => {
        this.sharedFacade.setLoading(false);
        this.loading.set(false);
        this.toastService.showErrorToast('Erreur', errorMsg, 'keep-while-routing');
        this.analyticsService.trackEvent('Error', {
          customProps: {
            Action: `Error ${this.firstHeading()?.nativeElement.textContent || 'No title'}: ${error.message}(Status: ${error.status}) - ${this.editMode ? 'Update' : 'Create'} ${this.entitySignal()?.uuid}`,
          }
        });
        throw Error(error);
      }),
      tap(() => this.editMode = true),
      // fix for creation action, to hydrate app-form-media-update itemUuid
      delay(200),
    );
  }

  public onSubmit(publish = false) {
    this.isSubmitted.set(true);
    this.entityForm.updateValueAndValidity();
    this.entityForm.markAllAsTouched();
    this.updateSubFormsValueAndValidity();
    if (!this.entityForm.valid) {
      this.toastService.showErrorToast('Erreur', 'Veuillez corriger les erreurs avant d\'enregister');
      return;
    }

    // Format fields
    let formValues = this.formFields();
    if (this.editMode) {
      formValues = this.cleanFormValues(formValues, this.subFormToUpdate ? this.entityForm.get(this.subFormToUpdate) as FormGroup : this.entityForm);
    }
    if (!this.entityForm.pristine) {
      const initialModeEdit = this.editMode;
      this.sharedFacade.setLoading(true);
      this.loading.set(true);
      this.updateEntity(formValues).pipe(
        switchMap((entityUpdated) => this.updateFile(entityUpdated)),
        switchMap((entityUpdated) => this.reloadEntity(entityUpdated)),
        tap((entityUpdated: T) => {
          this.entitySignal.update((entity) => ({...entity, ...entityUpdated}));
          this.resetForm();
        }),
        tap((entityUpdated) => this.cacheToUnvalidate(entityUpdated)),
        switchMap((entityUpdated) => {
          const paths = this.pathsToUnvalidateDataRequest(entityUpdated);
          if (publish && paths.length === 0) {
            this.toastService.showWarnToast('Alerte', `La publication a échoué`, 'keep-while-routing');
            return of(entityUpdated);
          }
          return publish ? this.invalidateCacheService.unvalidateCache(paths, []).pipe(
            catchError(() => {
              this.toastService.showWarnToast('Erreur', `La publication a échoué`, 'keep-while-routing');
              return of(entityUpdated);
            })
          ) : of(entityUpdated);
        }),
      ).subscribe({
        error: (e) => {
          console.log('Error during update', e);
          this.sharedFacade.setLoading(false);
          this.loading.set(false);
        },
        next: () => {
          this.toastService.showSuccessToast('Succès', this.successMsg, 'keep-while-routing');
          this.sharedFacade.setLoading(false);
          this.loading.set(false);
          this.entityForm.markAsPristine();
          this.markSubFormsAsPristine();
          this.isSubmitted.set(false);
          if (!initialModeEdit) {
            this.redirectAfterCreate(this.entitySignal()!);
          } else {
            this.redirectAfterUpdate(this.entitySignal()!);
          }
        },
        complete: () => {
          this.sharedFacade.setLoading(false);
          this.setCustomAnalyticsProps();
          this.analyticsService.trackEvent('Submit', {
            customProps: {
              Action: `MAJ ${this.firstHeading()?.nativeElement.textContent || 'No title'}: ${this.editMode ? 'Update' : 'Create'} ${this.entitySignal()?.uuid}${this.customAnalyticsProps || ''}`,
            }
          });
          this.loading.set(false);
        }
      });
    }
  }
}
