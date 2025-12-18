import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignal,
  output,
  signal,
  ViewChild,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Action,
  ACTION_CONFIRMATION,
  ACTION_CONFIRMATION_VALUES,
  ActionConfirmation,
  ACTIONS,
  ACTIONS_VALUES,
  Status,
  STATUS,
  STATUS_VALUES
} from "./model/status-rules";
import { DatePipe, NgClass, NgStyle } from "@angular/common";
import { ToastModule } from "primeng/toast";
import { UserRole } from "@shared/utils/models/user-details";
import { ProjectService } from "@shared/services/project.service";
import { KlubProject, ProjectStatus } from "@shared/utils/models/klubr";
import { ProjectChangeLimitDateComponent } from "../project-change-limit-date/project-change-limit-date.component";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { DialogService } from "primeng/dynamicdialog";
import { Observable, of } from "rxjs";
import { InvalidateCacheService } from "@shared/services/invalidate-cache.service";
import { ToastService } from "@shared/services/misc/toast.service";
import { Select } from "primeng/select";
import { ConfirmDialogWrapperService } from "@shared/components/dialog/confirm-dialog/confirm-dialog-wrapper.service";
import { AnalyticsService } from "@shared/services/analytics/analytics.service";

@Component({
  selector: 'app-project-state-dropdown',
  imports: [
    Select,
    FormsModule,
    NgClass,
    NgStyle,
    ToastModule
  ],
  providers: [DialogService],
  templateUrl: './project-state-dropdown.component.html',
  styleUrl: './project-state-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ProjectStateDropdownComponent {
  public confirmDialogWrapperService = inject(ConfirmDialogWrapperService);
  private toastService = inject(ToastService);
  private projectService = inject(ProjectService);
  private dialogService = inject(DialogService);
  private invalidateCacheService = inject(InvalidateCacheService);
  private analyticsService = inject(AnalyticsService);

  public options: WritableSignal<Array<ACTIONS_VALUES>> = signal<Array<ACTIONS_VALUES>>(ACTIONS.map(action => action.actionLabel));
  public startStatus: InputSignal<STATUS_VALUES> = input<STATUS_VALUES>(STATUS_VALUES.DRAFT);
  public projectUuid: InputSignal<string | undefined> = input<string | undefined>();
  public userRole: InputSignal<UserRole | undefined> = input<UserRole | undefined>(undefined);
  public disabled: InputSignal<boolean> = input<boolean>(false);
  public size: InputSignal<ProjectStateDropdownComponentSizes> = input<ProjectStateDropdownComponentSizes>('normal');
  public pathsToUnvalidate: InputSignal<Array<string>> = input<Array<string>>([]);
  public limitDateChanged = output<Date>();
  public onChange = output<ProjectStatus>();

  public currentStatus: WritableSignal<Status | undefined> = signal<Status>(STATUS.find((s: Status) => s.key === this.startStatus())!);
  public tempStatus: WritableSignal<Status | undefined> = signal<Status | undefined>(this.currentStatus());
  public loading: WritableSignal<boolean> = signal<boolean>(false);
  private intiated = false;
  private datePipe = new DatePipe('en-US');


  @ViewChild('select') select!: Select;

  constructor() {
    effect(() => {
      if (!this.intiated) {
        this.intiated = true;
        this.updateStatus(STATUS.find((s: Status) => s.key === this.startStatus())!);
      }
    });
    effect(() => {
      if (this.userRole()) {
        this.updateOptions();
      }
    });
    effect(() => {
      if (this.startStatus()) {
        this.currentStatus.set(STATUS.find((s: Status) => s.key === this.startStatus())!);
      }
    });
  }

  updateStatus(status: Status) {
    this.currentStatus.set(status);
    this.tempStatus.set(this.currentStatus());
    this.onChange.emit(status.apiKey);
  }

  onStatusChange(event: any) {
    if (!event.value) {
      return;
    }
    const action = (ACTIONS.find((action: Action) => action.actionLabel === event.value));
    this.currentStatus.set(this.tempStatus());
    this.triggerAction(action?.actionLabel!, action?.actionEnd!);
  }

  triggerAction(actionLabel: ACTIONS_VALUES, newStatus: Status) {
    let actionConfirmation: ACTION_CONFIRMATION_VALUES;
    switch (actionLabel) {
      case ACTIONS_VALUES.DELETE:
        actionConfirmation = ACTION_CONFIRMATION_VALUES.DELETE;
        break;
      case ACTIONS_VALUES.PUBLISH:
        actionConfirmation = ACTION_CONFIRMATION_VALUES.PUBLISH;
        break;
      case ACTIONS_VALUES.REQUEST_APPROVAL:
        actionConfirmation = ACTION_CONFIRMATION_VALUES.REQUEST_APPROVAL;
        break;
      case ACTIONS_VALUES.CLOSE:
        actionConfirmation = ACTION_CONFIRMATION_VALUES.CLOSE;
        break;
      case ACTIONS_VALUES.RESTORE:
        actionConfirmation = ACTION_CONFIRMATION_VALUES.RESTORE;
        break;
    }
    if (this.projectUuid()) {
      this.projectAction(ACTION_CONFIRMATION.find((a: ActionConfirmation) => a.key === actionConfirmation)!,
        this.projectUuid()!, newStatus);
    } else {
      this.toastService.showErrorToast('Erreur', 'Impossible de trouver le projet');
    }
  }

  updateOptions() {
    if (!this.currentStatus()) {
      return;
    }
    const options: Array<ACTIONS_VALUES> = [];
    ACTIONS.map((action: Action) => {
      if (action.authorizedRoles.includes(this.userRole()!)) {
        const currentInActionStart = action.actionStart.find((status: Status) => status.key === this.currentStatus()!.key);
        const currentInActionEnd = action.actionEnd.key === this.currentStatus()!.key
        if (!currentInActionEnd && !!currentInActionStart) {
          options.push(action.actionLabel);
        }
      }
    });
    this.options.set(options);
  }

  projectAction(action: ActionConfirmation, projectUuid: string, newStatus: Status) {

    this.loading.set(true);
    if (action.key === ACTION_CONFIRMATION_VALUES.RESTORE) {
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      const ref = this.dialogService.open(ProjectChangeLimitDateComponent, {
        header: `${action.toastLabel}`,
        width: '40rem',
        contentStyle: {overflow: 'auto'},
        styleClass: 'overflow-visible',
        modal: true,
        breakpoints: {
          '1199px': '40vw',
          '460px': '90vw'
        },
        data: {
          dateLimit: this.datePipe.transform(oneMonthLater, 'yyyy-MM-dd'),
          message: `Afin de republier votre projet, veuillez choisir une nouvelle date limite de financement.`
        }
      });
      ref?.onClose.pipe(
        take(1),
      ).subscribe((dateLimiteFinancementProjet: Date | undefined) => {
        if (dateLimiteFinancementProjet) {
          const data: { status: ProjectStatus } | { ProjectStatus: string, dateLimiteFinancementProjet: Date } = {
            status: newStatus.apiKey,
            dateLimiteFinancementProjet: new Date(this.datePipe.transform(dateLimiteFinancementProjet, 'yyyy-MM-dd')!),
          }
          this.updateProjet(action, projectUuid, newStatus, data);
        } else {
          this.reInitDropdown();
          this.loading.set(false);
        }
      });
    } else {
      const data: { status: ProjectStatus } | { status: ProjectStatus, dateLimiteFinancementProjet: Date } = {
        status: newStatus.apiKey,
        ...(newStatus.key === STATUS_VALUES.CLOSED ?
          {dateLimiteFinancementProjet: this.datePipe.transform(new Date(), 'yyyy-MM-dd')} : {})
      }

      this.confirmDialogWrapperService.confirm({
        closable: false,
        acceptLabel: action.buttonLabel,
        message: `Voulez-vous ${action.label} ce projet ?`,
        header: `${action.toastLabel}`,
        accept: () => {
          this.updateProjet(action, projectUuid, newStatus, data);
        },
        reject: () => {
          this.reInitDropdown();
          this.loading.set(false);
        },
      });

    }

  }

  pathToUnvalidateRequest(projectUpdated: KlubProject): Observable<KlubProject> {
    return this.pathsToUnvalidate().length > 0
      ? this.invalidateCacheService.unvalidateCache(this.pathsToUnvalidate(), []).pipe(
        catchError(() => {
          this.toastService.showWarnToast('Erreur', `La publication a échoué`);
          return of(projectUpdated);
        }),
        map(() => projectUpdated),
      ) : of(projectUpdated)
  }

  updateProjet(action: ActionConfirmation, projectUuid: string, newStatus: Status, data: Partial<KlubProject>) {
    this.projectService.updateProject(projectUuid, {...data}).pipe(
      take(1),
      switchMap((projectUpdated: KlubProject) => this.pathToUnvalidateRequest(projectUpdated)),
    ).subscribe({
      next: (projectUpdated: KlubProject) => {
        this.loading.set(false);
        this.updateStatus(newStatus);
        if (newStatus.key === STATUS_VALUES.CLOSED || action.key === ACTION_CONFIRMATION_VALUES.RESTORE) {
          this.limitDateChanged.emit(projectUpdated.dateLimiteFinancementProjet);
        }
        let detail = `${action.toastLabel} confirmé`;
        if (newStatus.key === STATUS_VALUES.WAITING_APPROVAL) {
          detail = `Le projet a été envoyé pour approbation par email au dirigeant.`;
        }
        this.analyticsService.trackEvent('Submit', {
          customProps: {
            Action: `MAJ ProjectStatus to ${newStatus.label}(${action.toastLabel}): ${projectUuid}`,
          }
        });
        this.toastService.showSuccessToast('Confirmé', detail);
      },
      error: (error) => {
        this.reInitDropdown();
        this.loading.set(false);
        this.analyticsService.trackEvent('Submit', {
          customProps: {
            Action: `Error ProjectStatus to ${newStatus.label}(${action.toastLabel}): ${error.message}(Status: ${error.status}) - ${projectUuid}`,
          }
        });

        this.toastService.showErrorToast('Rejeté', `${action.toastLabel} rejeté`);
      }
    });
  }

  reInitDropdown() {
    const tmp = this.currentStatus();
    this.select.clear();
    this.currentStatus.set(tmp);
  }
}

export type ProjectStateDropdownComponentSizes = 'normal' | 'small' | 'large';
