import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  Signal,
  signal,
  untracked,
  WritableSignal
} from '@angular/core';
import { ITab, ITabActions, ITabContent, TabContentContext } from "@shared/utils/models/tabContent";
import { ImageModule } from "primeng/image";
import { DatePipe, NgIf } from "@angular/common";
import { TabContentSidebarComponent } from "./tab-content-sidebar/tab-content-sidebar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, NEVER, Observable, of, skip, switchMap } from "rxjs";
import { defaultInvoicePopulate, defaultInvoiceSort, InvoiceService } from "@shared/services/entities/invoice.service";
import { catchError, map, take, tap } from "rxjs/operators";
import { DonationService } from "@shared/services/donation-service.service";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { BalanceDonLineComponent } from "./balance-don-line/balance-don-line.component";
import { LottieComponent } from "ngx-lottie";
import { CachingService } from "@shared/services/caching.service";
import { ApiListResult, MetaPagination } from "@shared/utils/models/misc";
import { Invoice, InvoiceLineReference } from "@shared/utils/models/invoice";
import { PermissionsService } from "@shared/services/permissions.service";
import { TabContentServiceService } from "./tab-content-service.service";
import { Button } from "primeng/button";
import { ProjectService } from "@shared/services/project.service";
import { ProjectFilters } from "../../../../project/model/project-filters";
import { KlubProject } from "@shared/utils/models/klubr";
import {
  ProjectChangeLimitDateComponent
} from "@shared/components/project/project-change-limit-date/project-change-limit-date.component";
import { DialogService } from "primeng/dynamicdialog";
import { ToastService } from "@shared/services/misc/toast.service";
import { InvalidateCacheService } from "@shared/services/invalidate-cache.service";
import { FormsModule } from "@angular/forms";
import { Select } from "primeng/select";
import { fadeAnimation } from "@shared/utils/animations/animations";

@Component({
  selector: 'app-tab-content',
  imports: [
    ImageModule,
    NgIf,
    TabContentSidebarComponent,
    BalanceDonLineComponent,
    LottieComponent,
    Button,
    Select,
    FormsModule,
  ],
  providers: [
    TabContentServiceService,
    DialogService,
  ],
  templateUrl: './tab-content.component.html',
  styleUrl: './tab-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation]
})
export class TabContentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly invoiceService = inject(InvoiceService);
  protected readonly donationService = inject(DonationService);
  protected readonly sharedFacade = inject(SharedFacade);
  protected readonly permissionsService = inject(PermissionsService);
  protected readonly cdr = inject(ChangeDetectorRef);
  protected readonly cachingService = inject(CachingService);
  protected readonly tabContentServiceService = inject(TabContentServiceService);
  protected readonly projectService = inject(ProjectService);
  protected readonly dialogService = inject(DialogService);
  protected readonly toastService = inject(ToastService);
  protected readonly invalidateCacheService = inject(InvalidateCacheService);
  private readonly datePipe = new DatePipe('fr-FR');

  public profile: Signal<KlubrMembre | null> = this.sharedFacade.profile;

  TAB: WritableSignal<ITab> = signal<ITab>({
    context: 'CLUB',
    content: []
  });
  selectedContent: WritableSignal<ITabContent | undefined> = signal<ITabContent | undefined>(undefined);
  isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public dataUpdated: WritableSignal<number> = signal<number>(0);

  public paginationEnabled: WritableSignal<boolean> = signal<boolean>(true);
  public pagination: WritableSignal<MetaPagination | undefined> = signal(undefined);
  public page: WritableSignal<number> = signal(1);
  public pageSize: WritableSignal<number> = signal(10);

  // Don projects specifics
  public period: WritableSignal<{
    month: string,
    year: string,
    label: string,
    currentMonth?: boolean
  } | undefined> = signal(this.getCurrentMonth());
  public availableMonths: WritableSignal<Array<{
    month: string,
    year: string,
    label: string,
    currentMonth?: boolean
  }>> = signal(this.generateAvailableMonths());

  static projectsFundraisingInProgress = 'Projets (collecte en cours)';

  constructor() {
    this.reloadCurrentRouteOnProfileChange();
  }

  protected reloadCurrentRouteOnProfileChange() {
    this.sharedFacade.profileChanged$.pipe(
      skip(1),
      takeUntilDestroyed(),
    ).subscribe({
      next: (profile: KlubrMembre | null) => {
        if (profile) {
          console.log('reloadCurrentRouteOnProfileChange');
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

  ngOnInit(): void {
    this.isLoading.set(true);
    this.route.url.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((url) => {
        this.TAB.update((tab) => ({...tab, content: []}));
        this.TAB.update((tab) => ({
          ...tab,
          context: url[0]?.path?.toUpperCase() as TabContentContext || 'CLUB'
        }));
      }),
      switchMap(() => this.loadData()),
    ).subscribe();
  }

  getcacheKey(): string {
    switch (this.TAB().context) {
      case "CLUB":
        return `invoices-dons-club-${this.permissionsService.memberIsAdminSignal() ? 'superAdmin' : this.sharedFacade.currentKlub()?.uuid}-page${untracked(this.page)}`
      case "PROJETS":
        return `invoices-dons-projets-${untracked(this.period)?.month + '-' + untracked(this.period)?.year}-${this.permissionsService.memberIsAdminSignal() ? 'superAdmin' : this.sharedFacade.currentKlub()?.uuid}-page${untracked(this.page)}`
      case "FACTURES":
        return `invoices-${untracked(this.period)?.month + '-' + untracked(this.period)?.year}-${this.permissionsService.memberIsAdminSignal() ? 'superAdmin' : this.sharedFacade.currentKlub()?.uuid}-page${untracked(this.page)}`
      default:
        return '';
    }

  }

  loadData() {
    let request;
    const isAdmin = this.permissionsService.memberIsAdminSignal();
    const klubUuid = isAdmin ? undefined : this.profile()!.klubr.uuid;
    switch (this.TAB().context) {
      case "CLUB":
        // GET first line
        // TODO: getNotBilledKlubDon get only the 100 last donations, we should get all the donations
        request = this.donationService.getNotBilledKlubDon().pipe(
          tap((data) => {
            const firstTabContent = this.tabContentServiceService.formatDonationsToClubTabContent(data, undefined, 0);
            if (firstTabContent) {
              this.TAB.update((tab) => {
                tab.content.push(firstTabContent);
                return tab;
              });
            }
          }),
          switchMap(() => this.cachingService.cacheObservable<ApiListResult<Invoice>>(
            this.getcacheKey(),
            this.invoiceService.getInvoices(
              undefined,
              defaultInvoicePopulate,
              `filters[invoice_lines][reference][$eq]=${encodeURI(InvoiceLineReference.DONATION_CLUB)}&filters[invoice_lines][isCreditLine][$eq]=true`,
              defaultInvoiceSort,
              untracked(this.page),
              untracked(this.pageSize)
            ))
          ),
          tap((data) => {
            const otherTabContent = data.data.map((invoice, index) => {
              return this.tabContentServiceService.formatInvoiceToClubTabContent(invoice, isAdmin ? klubUuid : undefined, index + 1);
            }).filter((invoice): invoice is ITabContent => !!invoice);
            this.TAB.update((tab) => {
              tab.content.push(...otherTabContent);
              return tab;
            });
          }),
          tap((data) => {
            this.paginationEnabled.set(data.meta.pagination.pageCount > 1);
            this.pagination.set(data.meta.pagination);
            this.cdr.markForCheck();
          }),
          map(() => null),
        );
        break;
      case "PROJETS":
        const filters: ProjectFilters = {
          klubrUUIDs: klubUuid ? [klubUuid] : [],
          isTemplate: false,
        }
        if (untracked(this.period) && !untracked(this.period)?.currentMonth) {
          filters.invoicePeriod = [`${untracked(this.period)?.year}/${untracked(this.period)?.month}`];
        } else {
          const firstDayOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          filters.invoiceLines = [null];
          filters.limitDate = firstDayOfCurrentMonth;
          filters.status = ['published', 'closed'];
        }
        request = this.cachingService.cacheObservable<ApiListResult<KlubProject>>(
          this.getcacheKey(),
          this.projectService.getProjectsWithFilters(filters, ['invoice_line.invoice', ...(this.permissionsService.memberIsAdminSignal() ? ['klubr.logo'] : [])], undefined, ['dateLimiteFinancementProjet:asc'], untracked(this.page), untracked(this.pageSize))
        ).pipe(
          tap((data) => {
            const tabContent = data.data.map((project, index) => {
              return this.tabContentServiceService.formatProjectTabContent(project, undefined, untracked(this.period)?.currentMonth, index);
            }).filter((project): project is ITabContent => !!project);
            this.TAB.update((tab) => {
              tab.content.push(...tabContent);
              return tab;
            });
          }),
          tap((data) => {
            this.paginationEnabled.set(data.meta.pagination.pageCount > 1);
            this.pagination.set(data.meta.pagination);
            this.cdr.markForCheck();
          }),
          map(() => null),
        );
        break;
      case "FACTURES":
        request = this.cachingService.cacheObservable<ApiListResult<Invoice>>(
          this.getcacheKey(),
          this.invoiceService.getInvoices(
            undefined,
            defaultInvoicePopulate,
            undefined,
            defaultInvoiceSort,
            untracked(this.page),
            untracked(this.pageSize)
          )).pipe(
          tap((data) => {
            const tabContent = data.data.map((invoice, index) => {
              return this.tabContentServiceService.formatInvoiceTabContent(invoice, undefined, index);
            }).filter((project): project is ITabContent => !!project);
            this.TAB.update((tab) => {
              tab.content.push(...tabContent);
              return tab;
            });
            console.log('this.TAB', this.TAB());
          }),
          tap((data) => {
            this.paginationEnabled.set(data.meta.pagination.pageCount > 1);
            this.pagination.set(data.meta.pagination);
            this.cdr.markForCheck();
          }),
          map(() => null),
        );
        break;
      default:
        request = NEVER;
        break;
    }
    return request.pipe(
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }

  changePage(page: number) {
    this.page.set(page);
    this.loadData().subscribe();
  }

  actionHandler(action: ITabActions, event: ITabContent) {
    console.log('actionHandler', action, event);
    switch (action) {
      case 'controlSideBar':
        this.controlSideBar(event);
        break;
      case 'changeProjectDate':
        this.changeProjectDate(event);
        break;
      case 'downloadInvoice':
        this.downloadInvoice(event);
        break;
    }
  }

  downloadInvoice(invoice: ITabContent) {
    if (invoice.contextObject?.invoice) {
      this.invoiceService.downloadInvoice(invoice.contextObject!.invoice!.uuid, invoice.contextObject!.invoice?.invoiceNumber);
    }
  }

  controlSideBar(event?: ITabContent) {
    this.selectedContent.set(event);
  }

  // PROJECTS DONS
  getPeriod(month?: string, year?: string) {
    return {
      month: month || ((new Date()).getMonth() + 1).toString().padStart(2, '0'),
      year: year || ((new Date()).getFullYear() + 1).toString().padStart(4, '0')
    };
  }

  changePeriod(period?: { month: string, year: string, label: string }) {
    console.log('changePeriod', period);
    this.TAB.update((tab) => ({...tab, content: []}));
    this.period.set(period);
    this.loadData().subscribe();
  }

  changeProjectDate(event?: ITabContent) {
    const project = event?.contextObject?.project;
    if (!project) {
      return;
    }
    const ref = this.dialogService.open(ProjectChangeLimitDateComponent, {
      header: `Modifier la date limite de financement`,
      width: '40rem',
      modal: true,
      contentStyle: {overflow: 'auto'},
      styleClass: 'overflow-visible',
      breakpoints: {
        '1199px': '40vw',
        '460px': '90vw'
      },
      data: {
        dateLimit: this.datePipe.transform(project.dateLimiteFinancementProjet, 'yyyy-MM-dd'),
        message: `Veuillez choisir une nouvelle date limite de financement pour votre projet.`
      }
    });
    ref.onClose.pipe(
      take(1),
    ).subscribe((dateLimiteFinancementProjet: Date | undefined) => {
      if (dateLimiteFinancementProjet) {
        const data: { dateLimiteFinancementProjet: Date } = {
          dateLimiteFinancementProjet: new Date(this.datePipe.transform(dateLimiteFinancementProjet, 'yyyy-MM-dd')!),
        }
        this.projectService.updateProject(project.uuid, {...data}).pipe(
          take(1),
          switchMap((projectUpdated: KlubProject) => this.pathToUnvalidateRequest(projectUpdated)),
        ).subscribe({
          next: (projectUpdated: KlubProject) => {
            this.updateTABProject(projectUpdated);
            this.toastService.showSuccessToast('Confirmé', `La date limite de financement a été mise à jour`);
            this.dataUpdated.update((data) => data + 1);
            this.cachingService.clearCacheKey(this.getcacheKey());
          },
          error: () => {
            this.isLoading.set(false);
            this.toastService.showErrorToast('Rejeté', `Erreur lors de la mise à jour de la date limite de financement`);
          },
          complete: () => {
            this.isLoading.set(false);
          }
        });
      } else {
        this.isLoading.set(false);
      }
    });
  }

  updateTABProject(project: KlubProject) {
    console.log('updateTABProject', project, project.klubr?.uuid);
    this.TAB.update((tab) => {
      let lineToUpdate = tab.content.find((content): content is ITabContent => content.contextObject?.project?.uuid === project.uuid);
      const dataToUpdate = this.tabContentServiceService.formatProjectTabContent(project, project.klubr.uuid, true, lineToUpdate?.contextDetail.version);
      if (lineToUpdate) {
        lineToUpdate.contextDetail.version++;
        lineToUpdate.contextObject!.project = project;
        lineToUpdate.contextData = dataToUpdate!.contextData;
        const updatedContent = tab.content.map((content) =>
          content.contextObject?.project?.uuid === project.uuid ? lineToUpdate : content
        ).filter((content): content is ITabContent => !!content);
        return {
          ...tab,
          content: updatedContent
        };
      }
      return ({...tab, content: []});
    });
  }

  pathToUnvalidateRequest(projectUpdated: KlubProject): Observable<KlubProject> {
    const pathsToUnvalidate: Array<string> = [];
    return pathsToUnvalidate.length > 0
      ? this.invalidateCacheService.unvalidateCache(pathsToUnvalidate, []).pipe(
        catchError(() => {
          this.toastService.showWarnToast('Erreur', `La publication a échoué`);
          return of(projectUpdated);
        }),
        map(() => projectUpdated),
      ) : of(projectUpdated)
  }

  getCurrentMonth() {
    const currentMonth = (new Date()).getMonth() + 1;
    const currentYear = (new Date()).getFullYear();
    return {
      month: (currentMonth).toString().padStart(2, '0'),
      year: currentYear.toString(),
      label: TabContentComponent.projectsFundraisingInProgress,
      currentMonth: true,
    };
  }

  generateAvailableMonths() {
    const currentMonth = (new Date()).getMonth() + 1;
    const currentYear = (new Date()).getFullYear();
    const availableMonths = [];
    for (let i = 0; i < 12; i++) {
      const transformedDate = this.datePipe.transform(new Date(currentYear, currentMonth - i - 1, 1), 'MMMM yyyy')!;
      const label = (i === 0) ? TabContentComponent.projectsFundraisingInProgress : transformedDate.charAt(0).toUpperCase() + transformedDate.slice(1);
      availableMonths.push({
        month: (currentMonth - i).toString().padStart(2, '0'),
        year: (currentMonth - i) <= 0 ? (currentYear - 1).toString() : currentYear.toString(),
        label,
        currentMonth: i === 0,
      });
    }
    return availableMonths;
  }

}
