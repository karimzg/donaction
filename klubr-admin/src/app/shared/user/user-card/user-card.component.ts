import { Component, inject, model, signal, ViewChild } from '@angular/core';
import { UserDetail } from "@shared/utils/models/user-details";
import { Tag } from "primeng/tag";
import { KlubInfosComponent } from "@shared/components/klub/klub-infos/klub-infos.component";
import { DatePipe } from "@angular/common";
import { Popover } from "primeng/popover";
import { RoleTagComponent } from "@shared/components/atoms/role-tag/role-tag.component";
import { UserRoleTagComponent } from "@shared/components/atoms/user-role-tag/user-role-tag.component";
import { DeviceService } from "@shared/services/device.service";
import { Drawer } from "primeng/drawer";
import { LastProfileUsedPipe } from "@shared/pipes/user/last-profile-used.pipe";

@Component({
  selector: 'app-user-card',
  imports: [
    Tag,
    KlubInfosComponent,
    DatePipe,
    Popover,
    RoleTagComponent,
    UserRoleTagComponent,
    Drawer,
    LastProfileUsedPipe,
  ],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  private deviceService = inject(DeviceService);

  user = model.required<UserDetail>();

  public showProfilesDrawer = signal(false);
  public showDonationsDrawer = signal(false);
  @ViewChild('profilesOp') profilesOp!: Popover;
  @ViewChild('donationsOp') donationsOp!: Popover;

  public toggleUserOp(event: MouseEvent) {
    this.deviceService.isMobile() ? this.showProfilesDrawer.set(!this.showProfilesDrawer()) : this.profilesOp.toggle(event);
  }

  public toggleDonationOp(event: MouseEvent) {
    this.deviceService.isMobile() ? this.showDonationsDrawer.set(!this.showDonationsDrawer()) : this.donationsOp.toggle(event);
  }
}
