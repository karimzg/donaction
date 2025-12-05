import { Component, inject, input, InputSignal } from '@angular/core';
import { MemberCardComponent } from "@shared/components/member/member-card/member-card.component";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { AvatarModule } from "primeng/avatar";
import { ChipModule } from "primeng/chip";
import { MemberUpdateComponent } from "../member-update/member-update.component";
import { take } from "rxjs/operators";
import { DialogService } from "primeng/dynamicdialog";
import { InvitationPopUpComponent } from "../invitation-pop-up/invitation-pop-up.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { defaultProfilePopulate, defaultProfileSort, ProfileService } from "@shared/services/profile.service";
import { ProfileFilters } from "../../model/profile-filters";
import { ApiListResult } from "@shared/utils/models/misc";
import { Observable } from "rxjs";
import { ToastService } from "@shared/services/misc/toast.service";
import { BadgeModule } from "primeng/badge";
import { MemberFiltersComponent } from "../member-filters/member-filters.component";
import { ButtonModule } from "primeng/button";
import { GenericListingComponent } from "@shared/components/generics/generic-listing/generic-listing.component";
import { ListHeaderComponent } from "@shared/components/lists/list-header/list-header.component";
import {
  ListLoadingNoResultsComponent
} from "@shared/components/lists/list-loading-no-results/list-loading-no-results.component";
import { Location } from "@angular/common";
import { Klubr } from "@shared/utils/models/klubr";
import { fadeAnimation } from "@shared/utils/animations/animations";
import { ScrollNearEndDirective } from "@shared/utils/Directives/scroll-near-end-directive.directive";
import { DeviceService } from "@shared/services/device.service";

@Component({
  selector: 'app-member-listing',
  imports: [
    MemberCardComponent,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    AvatarModule,
    ChipModule,
    FormsModule,
    ReactiveFormsModule,
    BadgeModule,
    MemberFiltersComponent,
    ButtonModule,
    ListHeaderComponent,
    ListLoadingNoResultsComponent,
    ScrollNearEndDirective,
  ],
  providers: [DialogService],
  templateUrl: './member-listing.component.html',
  styleUrl: './member-listing.component.scss',
  animations: [fadeAnimation]
})
export class MemberListingComponent extends GenericListingComponent<KlubrMembre, ProfileFilters> {
  protected override incrementalPagination = true;

  /* SPECIFIC SERVICES */
  public dialogService = inject(DialogService);
  public profileService = inject(ProfileService);
  private toastService = inject(ToastService);
  private location = inject(Location);
  private deviceService = inject(DeviceService);

  /* OVERRIDED METHODDS */
  protected override requestListWithFilters(klubUuid?: string | null, filters?: ProfileFilters, page = 1): Observable<ApiListResult<KlubrMembre>> {
    const pageSize = this.deviceService.isMobile() ? 10 : 50;
    // Need to populate this way (not  with populateArray), cause we need populate fields. Moreover, we need to set populateOneLevel = true
    const queryParams = 'withEmails=true' + (this.permissionsService.memberIsAdmin(this.profile()!) ? '&populate[klubr][fields]=denomination' : '');
    filters = filters || {};
    if (klubUuid) {
      filters.klubrUUIDs = [klubUuid];
    }
    return this.profileService.getProfilesWithFilters(filters, defaultProfilePopulate, queryParams, defaultProfileSort, page, pageSize, true);
  }

  /* SPECIFIC VARS */
  public klubrInit: InputSignal<Klubr | undefined> = input<Klubr | undefined>(undefined);
  public accountInit: InputSignal<boolean | undefined> = input<boolean | undefined>(undefined);

  ngOnInit() {
    const urlWithoutQueryParam = this.location.path().split('?')[0];
    this.location.replaceState(urlWithoutQueryParam);

    /* SET INPUT FILTERS */
    this.setInputFilters();
  }

  setInputFilters(): void {
    const filters: ProfileFilters = {
      searchParams: undefined,
      klubrUUIDs: null,
      role: undefined,
      account: null,
      uuid: null,
    };
    if (this.klubrInit()?.uuid) {
      filters['klubrUUIDs'] = [this.klubrInit()!.uuid!];
    }
    if (this.accountInit() !== undefined) {
      filters['account'] = this.accountInit()!;
    }
    if (Object.keys(filters).length) {
      this.filtersList.set(filters);
    }
  }

  /* SPECIFIC METHODDS */
  addMemberDialog() {
    const ref = this.dialogService.open(MemberUpdateComponent, {
      header: 'Ajoutez un nouveau membre',
      modal: true,
      closable: true,
      width: '75rem',
      contentStyle: {overflow: 'auto'},
      styleClass: 'overflow-visible',
      breakpoints: {
        '1199px': '75vw',
        '575px': '90vw'
      },
      data: {
        profile: null,
      }
    });
    ref.onClose.pipe(
      take(1),
    ).subscribe((profileUpdated: KlubrMembre | undefined) => {
      if (profileUpdated) {
        this.toastService.showSuccessToast('Succès', `Le profil a été créé`);
        this.onFiltersChanged();
        this.showInvitationPopup(profileUpdated.code!, profileUpdated);
      }
    });
  }

  showInvitationPopup(codeInvitation: string, profile: KlubrMembre) {
    this.dialogService.open(InvitationPopUpComponent, {
      header: `Inviter ${profile.prenom} ${profile.nom} à rejoindre mon équipe`,
      width: '75rem',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '1199px': '75vw',
        '575px': '90vw'
      },
      data: {
        codeInvitation,
        codeType: 'profile'
      }
    });
  }
}
