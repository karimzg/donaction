import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, Signal } from '@angular/core';
import { AppMenuitemComponent } from '../app-menu.component';
import { SharedFacade } from '@shared/data-access/+state/shared.facade';
import { MenuItem } from 'primeng/api';
import { PermissionsService } from "@shared/services/permissions.service";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { AvatarModule } from "primeng/avatar";
import { RouterLink } from "@angular/router";
import { KlubInfosComponent } from "../klub/klub-infos/klub-infos.component";

@Component({
  selector: 'app-sidebar',
  imports: [
    AppMenuitemComponent,
    AvatarModule,
    RouterLink,
    KlubInfosComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  public sharedFacade = inject(SharedFacade);
  public permissionsService = inject(PermissionsService);
  public profile: Signal<KlubrMembre | null> = this.sharedFacade.profile;
  public el = inject(ElementRef);
  model = computed<MenuItem[]>(() => this.initializeModel())

  private initializeModel(): MenuItem[] {
    // const wipFeatureRights = (this.permissionsService.memberIsAtLeastLeaderSignal() && environment.env !== 'prod') || this.permissionsService.isAtLeastAdminEditorSignal();
    // DON MENU ITEMS
    const donLinks: MenuItem = this.permissionsService.memberIsAtLeastLeaderSignal() ? {
      label: 'Dons', icon: 'pi pi-fw pi-wallet', items: [
        {label: 'Liste des dons', icon: 'pi pi-angle-right', routerLink: ['/don/listing']},
        {
          label: 'Balance des Dons', icon: 'pi pi-angle-right', routerLink: ['/don/balance/club'], items: [
            {label: 'Club', icon: 'pi pi-angle-right', routerLink: ['/don/balance/club']},
            {label: 'Projets', icon: 'pi pi-angle-right', routerLink: ['/don/balance/projets']},
            {label: 'Factures', icon: 'pi pi-angle-right', routerLink: ['/don/balance/factures']},
          ]
        },
      ]
    } : {label: 'Dons', icon: 'pi pi-fw pi-wallet', routerLink: ['/don/listing']};


    const facturationLink: MenuItem = {
      label: 'Facturation', icon: 'pi pi-fw pi-receipt', items: [
        {label: 'Générer les factures', icon: 'pi pi-angle-right', routerLink: ['/facturation/generer']},
        {label: 'Gérer les factures', icon: 'pi pi-angle-right', routerLink: ['/facturation/gerer']},
      ]
    };

    const userLink: MenuItem = {
      label: 'Utilisateurs', icon: 'pi pi-users', routerLink: ['users/listing'],
    };
    const clubListLink: MenuItem = {
      label: 'Liste des clubs', icon: 'pi pi-list-check', routerLink: ['klub/listing'],
    };
    const statsLink: MenuItem = {
      label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/statistiques'],
    };

    // MAIN MENU ITEMS
    const menuItems: Array<MenuItem> = [
      {
        label: '', items: [
          {
            label: 'Mon Klub',
            icon: 'pi pi-fw pi-id-card',
            routerLink: this.permissionsService.memberIsAtLeastLeaderSignal() ? undefined : ['/'],
            items: this.permissionsService.memberIsAtLeastLeaderSignal() ? [
              ...(this.permissionsService.memberIsAtLeastLeaderSignal() ? [{
                label: 'Informations du klub',
                icon: 'pi pi-angle-right',
                // progress: this.profile()?.klubr?.klubr_info?.requiredFieldsCompletion,
                progress: this.sharedFacade.currentKlubInfosCompletion(),
                routerLink: [`/klub/${this.profile()!.klubr.uuid}/infos-legales`]
              }] : []),
              ...(this.permissionsService.memberIsAtLeastLeaderSignal() ? [{
                label: 'Documents',
                icon: 'pi pi-angle-right',
                // progress: this.profile()?.klubr?.klubr_info?.requiredDocsValidatedCompletion,
                progress: this.sharedFacade.currentKlubDocsCompletion(),
                routerLink: [`/klub/${this.profile()!.klubr.uuid}/documents`]
              }] : []),
            ] : undefined
          },
          ...(this.permissionsService.memberIsAtLeastLeaderSignal() ? [{
            label: 'Ma page Klub',
            icon: 'pi pi-fw pi-home',
            routerLink: [`/klub-house/${this.profile()!.klubr.uuid}/update`]
          }] : []),
          {label: 'Mes projets', icon: 'pi pi-fw pi-inbox', routerLink: ['/project/listing']},
          {label: 'Membres', icon: 'pi pi-fw pi-users', routerLink: ['/members/listing']},
          donLinks,
          {label: 'Supports de Com', icon: 'pi pi-fw pi-images', routerLink: ['/supports/communication']},
          {label: `Centre d'aide`, icon: 'pi pi-fw pi-file-pdf', routerLink: ['/aide/centre-d_aide']},
          // { label: 'Klubrs', icon: 'pi pi-fw pi-id-card', items: [] }
        ]
      },
    ];

    // ADD ADMIN MENU ITEMS
    if (this.permissionsService.memberIsAdminSignal()) {
      menuItems[0].items?.push(userLink, clubListLink, statsLink, facturationLink);
      menuItems[0].items?.push({
        label: 'CMS Media', isAdmin: true, icon: 'pi pi-fw pi-box', items: [
          {label: 'PWA', icon: 'pi pi-fw pi-microchip', routerLink: ['/admin-sandbox/pwa-sandbox']},
          {label: 'Unvalidate cache', icon: 'pi pi-undo pi-id-card', routerLink: ['/admin-sandbox/unvalidate']},
          {label: 'Klubr', icon: 'pi pi-fw pi-id-card', routerLink: ['/admin-sandbox/klubr']},
          {label: 'Klubr membres', icon: 'pi pi-fw pi-id-card', routerLink: ['/admin-sandbox/klub-membres']},
          {label: 'Klub projects', icon: 'pi pi-fw pi-id-card', routerLink: ['/admin-sandbox/klub-projects']},
          {
            label: 'Lottie animations',
            icon: 'pi pi-fw pi-discord',
            routerLink: ['/admin-sandbox/lottie-animations']
          },
          {label: 'Ngx Editor', icon: 'pi pi-fw pi-pencil', routerLink: ['/admin-sandbox/ngx-editor']},
          {label: 'Sandbox', icon: 'pi pi-fw pi-box', routerLink: ['/admin-sandbox/sandbox']},
        ]
      });
    }

    return menuItems;
  }

  // private updateModelWithKlubrs(klubrInfos?: Klubr[]): void {
  //   const klubrsItem = this.model()?.find((item:any) => item.label === '')?.items?.find((subItem:any) => subItem.label === 'Klubrs');
  //   if (klubrsItem && klubrInfos) {
  //     klubrsItem.items = klubrInfos.map(klubrInfo => ({
  //       label: klubrInfo.denomination,
  //       icon: '',
  //       routerLink: [`/${klubrInfo.slug}`],
  //     }));
  //   }
  //   console.log('klubrsItem', klubrsItem);
  // }
}
