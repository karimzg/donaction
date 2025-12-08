import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  model,
  OnInit,
  output,
  Signal,
  signal,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import { AvatarModule } from "primeng/avatar";
import { TagModule } from "primeng/tag";
import { FormsModule } from "@angular/forms";
import { ImageModule } from "primeng/image";
import { MeterGroupModule } from "primeng/metergroup";
import { KlubProject, ProjectStatus } from "@shared/utils/models/klubr";
import { ConfirmationService, MenuItem } from "primeng/api";
import { PermissionsService } from "@shared/services/permissions.service";
import { DialogService } from "primeng/dynamicdialog";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { ProjectStateDropdownComponent } from "../project-state-dropdown/project-state-dropdown.component";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { Router } from "@angular/router";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { ProjectStatusPipe } from "../project-state-dropdown/pipes/project-status.pipe";
import { ProjectService } from "@shared/services/project.service";
import { PreviewService } from "@shared/services/preview.service";
import { TooltipModule } from "primeng/tooltip";
import { fadeInOut } from "@shared/utils/animations/animations";
import { Menu } from "primeng/menu";
import { DatePipe } from "@angular/common";
import { PercentPipe } from "@shared/pipes/misc/percent.pipe";
import { DeviceService } from "@shared/services/device.service";
import { Drawer } from "primeng/drawer";

@Component({
  selector: 'app-project-card',
  imports: [
    AvatarModule,
    TagModule,
    FormsModule,
    ImageModule,
    MeterGroupModule,
    ProjectStateDropdownComponent,
    MediaPipe,
    ProjectStatusPipe,
    TooltipModule,
    Menu,
    DatePipe,
    PercentPipe,
    Drawer,

  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fadeInOut]
})
export class ProjectCardComponent implements OnInit {
  public permissionsService = inject(PermissionsService);
  public sharedFacade = inject(SharedFacade);
  public projectService = inject(ProjectService);
  public previewService = inject(PreviewService);
  private router = inject(Router);
  public deviceService = inject(DeviceService);

  profile: InputSignal<KlubrMembre | null> = input<KlubrMembre | null>(null);
  public projectCard = model.required<KlubProject>();
  public projectCardLimitDate: Signal<Date> = computed(() => this.projectCard()?.dateLimiteFinancementProjet);
  public pathsToUnvalidate: WritableSignal<Array<string>> = signal<Array<string>>([]);
  public isBilled: WritableSignal<boolean> = signal<boolean>(false);
  onDelete = output<boolean>();
  public menuOptions: Signal<MenuItem[]> = computed(() => (this.projectCard())
    ? [
      {
        label: 'Voir le projet',
        icon: 'pi pi-eye',
        command: () => {
          this.openPreview();
        },
        visible: this.projectCard()?.status !== "deleted" && !this.projectCard()?.isTemplate
      },
      {
        label: 'Voir les dons',
        icon: 'pi pi-wallet',
        command: () => {
          this.showDonations();
        },
        visible: this.projectCard()?.status !== "deleted"
          && !this.projectCard()?.isTemplate
          && !(this.profile()?.role === "KlubMember" && this.projectCard()?.klubr_membre?.uuid !== this.profile()?.uuid)
      },
      {
        label: 'Modifier le projet',
        icon: 'pi pi-pencil',
        command: () => {
          this.modifyProject();
        },
        visible: this.projectCard()?.status !== "deleted" &&
          (this.permissionsService.memberIsAtLeastLeaderSignal()
            || (this.profile()?.role === "KlubMember" && (this.projectCard()?.status === "waitingApproval"
              || this.projectCard()?.status === "draft")))
      },
      // TODO: Implement this feature
      // {
      //   label: 'Partager',
      //   icon: 'pi pi-share-alt',
      //   visible: this.projectCard()?.status !== "deleted"
      // },
      {
        label: 'Ajouter une réalisation',
        icon: 'pi pi-verified',
        command: () => {
          this.addRealization();
        },
        // TODO: check this.projectCard()?.status === "published" condition not working
        visible: this.projectCard()?.status === "published" && this.permissionsService.memberIsAtLeastLeaderSignal()
      },
    ]
    : []
  );
  public showActions: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit() {
    this.isBilled.set(!!this.projectCard()?.invoice_line);
    this.pathsToUnvalidate.set(this.projectService.pathsToUnvalidateDataRequest(this.projectCard()!));
  }

  onLimitDateChanged(event: Date) {
    this.projectCard!.update((project) => ({...project, dateLimiteFinancementProjet: event}));
  }

  onStatusChange(event: ProjectStatus) {
    this.projectCard!.update((project) => ({...project, status: event}));
  }

  public openPreview() {
    this.previewService.previewProject(this.projectCard()!, this.projectCard()!.klubr!);
  }

  public modifyProject() {
    if (this.projectCard()?.status !== "deleted") {
      if (this.permissionsService.memberIsAtLeastLeaderSignal() || (this.profile()?.role === "KlubMember" && (this.projectCard()?.status === "waitingApproval" || this.projectCard()?.status === "draft"))) {
        this.router.navigate(['/project', this.projectCard()?.uuid, 'update']);
      }
    }
  }

  public showDonations() {
    if (!this.projectCard()?.isTemplate && !(this.profile()?.role === "KlubMember" && this.projectCard()?.klubr_membre?.uuid !== this.profile()?.uuid)) {
      this.router.navigate(['/don', 'listing'], {queryParams: {filterProjectUuid: this.projectCard()?.uuid}});
    }
  }

  public addRealization() {
    if (this.projectCard()?.status === "published" && this.permissionsService.memberIsAtLeastLeaderSignal()) {
      this.router.navigate(['/project', this.projectCard()?.uuid, 'update'], {fragment: 'addRealisation'});
    }
  }

  toggleShowActions(): void {
    this.showActions.update((val) => !val);
  }
}
