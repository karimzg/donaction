import { Component, inject } from '@angular/core';
import { Observable } from "rxjs";
import { PermissionsService } from "@shared/services/permissions.service";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ButtonDirective } from "primeng/button";
import { Ripple } from "primeng/ripple";
import { environment } from "@environments/environment";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { AuthFacade } from "@app/routes/auth/data-access/+state/auth.facade";
import { ChipModule } from "primeng/chip";

@Component({
  selector: 'app-permissions-info',
  imports: [
    CommonModule,
    AsyncPipe,
    ButtonDirective,
    Ripple,
    ChipModule
  ],
  templateUrl: './permissions-info.component.html',
  styleUrl: './permissions-info.component.scss'
})
export class PermissionsInfoComponent {
  private readonly permissionsService = inject(PermissionsService);
  private readonly http = inject(HttpClient);
  public readonly authFacade = inject(AuthFacade);
  public permissionsArray: Array<{ label: string, permission$: Observable<boolean>, bold?: boolean }> = [];

  constructor() {
    this.permissionsArray = [{label: 'isAdmin', permission$: this.permissionsService.isAdmin$, bold: true},
      {label: 'isAdminEditor', permission$: this.permissionsService.isAdminEditor$, bold: true},
      {label: 'isAtLeastAdminEditor', permission$: this.permissionsService.isAtLeastAdminEditor$},
      {label: 'isNetwork', permission$: this.permissionsService.isNetwork$, bold: true},
      {label: 'isAtLeastNetwork', permission$: this.permissionsService.isAtLeastNetwork$},
      {label: 'isLeader', permission$: this.permissionsService.isLeader$, bold: true},
      {label: 'isAtLeastLeader', permission$: this.permissionsService.isAtLeastLeader$},
      {label: 'isMember', permission$: this.permissionsService.isMember$, bold: true},
      {label: 'isAtLeastMember', permission$: this.permissionsService.isAtLeastMember$},
      {label: 'isAuthenticated', permission$: this.permissionsService.isAuthenticated$, bold: true},
      {label: 'isAtLeastAuthenticated', permission$: this.permissionsService.isAtLeastAuthenticated$},
      {label: 'memberIsNetwork', permission$: this.permissionsService.memberIsNetwork$, bold: true},
    ];
  }

  test() {
    // this.http.get(environment.apiUrl + 'mecenat-reassurance').subscribe((res) => {
    //       console.log(res);
    //     });
    // this.http.get(environment.apiUrl + 'klub-dons/received-dons?populate[0]=klubr.logo&populate[1]=klubDonateur.logo&populate[2]=klubDonateur.avatar&populate[3]=klub_projet&filters[klub_projet]=43').pipe(
    this.http.get(environment.apiUrl + 'klub-dons/received-dons?populate[0]=klubr.logo&populate[1]=klubDonateur.logo&populate[2]=klubDonateur.avatar&populate[3]=klub_projet').pipe(
      map((res: any) => res.data),
      map((results: any) => {
        return results.map((res: any) => (
            {
              number: res.attestationNumber,
              montant: res.montant,
              klub: res.klubr?.denomination,
              projet: res.klub_projet?.titre,
              donateur: res.klubDonateur?.email,
            }
          )
        )
      }),
    ).subscribe((res) => {
      console.log(res);
    });
  }

}
