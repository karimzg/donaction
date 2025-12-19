import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';
import { LayoutService } from '@shared/services/layout.services';
import { AuthFacade } from '@app/routes/auth/data-access/+state/auth.facade';
import { MenuModule } from 'primeng/menu';
import { SharedFacade } from '@shared/data-access/+state/shared.facade';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { KlubrMembre } from "@shared/utils/models/user-details";
import { ChipModule } from "primeng/chip";
import { TagModule } from "primeng/tag";
import { AvatarModule } from "primeng/avatar";
import { ImageModule } from "primeng/image";
import { setSeverity } from "@shared/utils/helpers/role-severity";
import { RoleTagComponent } from "../atoms/role-tag/role-tag.component";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { flipAnimation } from "@shared/utils/animations/animations";
import { InputIcon } from "primeng/inputicon";
import { IconField } from "primeng/iconfield";
import { RadioButton } from "primeng/radiobutton";
import { Popover } from "primeng/popover";
import { Drawer, DrawerModule } from "primeng/drawer";
import { version } from "@environments/version";

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MenuModule,
    Popover,
    InputTextModule,
    FormsModule,
    ChipModule,
    TagModule,
    AvatarModule,
    ImageModule,
    RadioButton,
    DrawerModule,
    RoleTagComponent,
    IconField,
    InputIcon,
    ReactiveFormsModule,
    MediaPipe,
    RouterLink,
    Drawer,
    NgOptimizedImage,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [flipAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  public layoutService = inject(LayoutService);
  private authFacade = inject(AuthFacade);
  private sharedFacade = inject(SharedFacade);
  private router = inject(Router);
  private meDetails = this.authFacade.me;
  private rightSidebarVisibleState: boolean = false;
  public items = this.initializeItems();
  public profileItems = this.accountStaticItems();
  public profile: WritableSignal<KlubrMembre | null> = signal(null);
  public profiles: WritableSignal<Array<KlubrMembre>> = signal([]);
  public profilesPage: number = 1;
  public profilesSelected: WritableSignal<string | undefined> = signal(undefined);
  public searchProfileTerm: string = '';
  public profileTotal: WritableSignal<number> = signal<number>(0);
  public showOp: WritableSignal<boolean> = signal<boolean>(false);
  public hideTimeOut: WritableSignal<any> = signal<any>(null);
  public rightSidebarVisible: WritableSignal<boolean> = signal<boolean>(false);
  public pageSize: WritableSignal<number> = signal<number>(5);
  public version = version;
  public allNotifications = signal<boolean>(true);

  menuButton = viewChild.required<ElementRef>('menubutton');

  topbarMenuButton = viewChild.required<ElementRef>('topbarmenubutton');

  menu = viewChild.required<ElementRef>('topbarmenu');

  constructor() {
    this.setupEffects();
  }

  ngOnInit(): void {
    this.setProfilesData();
  }

  private setupEffects(): void {
    effect(() => {
      if (this.sharedFacade.profile()) {
        this.profile.set(this.sharedFacade.profile());
        this.profilesSelected.set(this.profile()?.uuid);
      }
    });
    effect(() => {
      if (this.rightSidebarVisible() && !this.rightSidebarVisibleState) {
        this.setProfilesData();
      }
      this.rightSidebarVisibleState = this.rightSidebarVisible();
    });
  }

  private initializeItems(): any[] {
    return [
      {
        id: 'teams',
        label: 'Mes Klubs',
        fonction: 'Membre',
        severity: setSeverity('KlubMember'),
        uuid: '',
        checked: false,
        items: [],
      },
    ];
  }

  private accountStaticItems(): any[] {
    return [
      {
        label: 'Mon profil',
        icon: 'pi pi-user',
        command: () => {
          this.redirectToMyProfilePage();
          this.closeMobileSidebar();
        },
      },
      {
        label: 'Mes dons',
        icon: 'pi pi-wallet',
        command: () => {
          this.redirectToMyDonationsPage();
          this.closeMobileSidebar();
        },
      },
      {
        label: 'Paramètres',
        icon: 'pi pi-cog',
        command: () => {
          this.redirectToEditAccountPage();
          this.closeMobileSidebar();
        },
      },
      {
        label: 'Déconnexion',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
          this.closeMobileSidebar();
        },
      },
    ];
  }

  public logout(): void {
    this.authFacade.logout();
  }

  private redirectToMyProfilePage(): void {
    this.router.navigate(['/profile']);
  }

  private redirectToMyDonationsPage(): void {
    this.router.navigate(['/don', 'mes-dons']);
  }

  private redirectToEditAccountPage(): void {
    this.router.navigate(['/edit-account']);
  }

  private setProfilesData(): void {
    const meDetails = this.meDetails();
    if (meDetails) {
      this.profilesPage = 1;
      this.profiles.set(meDetails.klubr_membres);
      this.updateMenuItemsWithProfiles();
      const nbProfiles = meDetails.klubr_membres.length || 0
      this.profileTotal.set(nbProfiles);
      this.items[0] = {...this.items[0], label: `${nbProfiles > 1 ? 'Mes Klubs(' + nbProfiles + ')' : 'Mon Klub'}`};
    }
  }

  public onSearchProfiles(): void {
    const meDetails = this.meDetails();
    if (meDetails) {
      const filteredProfiles: Array<KlubrMembre> = meDetails.klubr_membres.filter((membre) => {
        const searchTerm = this.searchProfileTerm.toLowerCase();
        return membre.klubr?.denomination.toLowerCase().includes(searchTerm)
          || membre.klubr?.acronyme.toLowerCase().includes(searchTerm)
          || membre.role.toLowerCase().includes(searchTerm)
          || membre.fonction.toLowerCase().includes(searchTerm)
      }).slice(0, this.pageSize());
      this.profilesPage = 1;
      this.profiles.set(filteredProfiles);
      this.updateMenuItemsWithProfiles();
    }
  }

  private updateMenuItemsWithProfiles(): void {
    const pageSize = this.pageSize();
    const profileTotal = this.profiles()?.length || 0;
    const profiles = this.profiles()?.slice((this.profilesPage - 1) * pageSize, pageSize * this.profilesPage) || [];

    const profilesItemIndex = this.items.findIndex(
      (item) => item.id === 'teams'
    );

    if (profilesItemIndex !== -1) {
      this.items[profilesItemIndex].hasNextPage = this.profilesPage * pageSize < profileTotal;
      this.items[profilesItemIndex].hasPreviousPage = this.profilesPage !== 1;
      if (profiles.length === 0) {
        this.items[profilesItemIndex].items = [{
          label: 'Aucune équipe correspondante',
          noResult: true,
          command: () => {
          },
        }];
      } else {
        this.items[profilesItemIndex].items = profiles.map((profile) => ({
          label: profile.klubr?.acronyme,
          fonction: profile?.fonction,
          severity: setSeverity(profile?.role),
          uuid: profile.uuid,
          icon: 'pi pi-users',
          img: profile.klubr?.logo,
          role: profile.role,
          command: () => {
            this.searchProfileTerm = '';
            this.closeMobileSidebar();
            return (this.profile()?.uuid !== profile.uuid) && this.sharedFacade.switchToProfile(profile.uuid)
          },
        }));
      }
    }
  }

  nextPage(): void {
    this.profilesPage++;
    this.updateMenuItemsWithProfiles();
  }

  previousPage(): void {
    this.profilesPage--;
    this.updateMenuItemsWithProfiles();
  }

  //Hover profile
  onHover(event: MouseEvent, op: Popover) {
    this.setProfilesData();
    clearTimeout(this.hideTimeOut());
    op.show(event);
    this.showOp.set(true);
  }

  onLeave(op: Popover) {
    this.hideTimeOut.set(setTimeout(() => {
      op.hide();
      this.searchProfileTerm = '';
    }, 100));
  }

  onOverlayEnter() {
    clearTimeout(this.hideTimeOut());
    this.showOp.set(true);
  }

  onOverlayLeave(op: Popover) {
    this.showOp.set(false);
    this.onLeave(op);
  }

  public toggleRightSidebar(): void {
    this.rightSidebarVisible.set(!this.rightSidebarVisible());
  }

  closeMobileSidebar(): void {
    this.rightSidebarVisible.set(false);
  }

  toggleAllNotifications(value: boolean) {
    this.allNotifications.set(value);
  }
}
