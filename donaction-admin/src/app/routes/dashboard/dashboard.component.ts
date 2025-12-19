import { Component, inject, OnDestroy, Renderer2, viewChild } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { LayoutService } from '@shared/services/layout.services';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { filter } from 'rxjs';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environments/environment";
import { downloadPDF, openPDFInNewWindow } from "@shared/utils/helpers/pdf-helpers";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MessageModule } from "primeng/message";
import { ActionId, MainMessageService } from "@shared/services/misc/main-message.service";
import { Severity2ToSeverityPipe } from "@shared/pipes/misc/severity2-to-severity.pipe";
import { ServiceWorkerService } from "@shared/services/sw/service-worker.service";

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarModule,
    MenuModule,
    MenubarModule,
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    ButtonModule,
    RippleModule,
    MessageModule,
    Severity2ToSeverityPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnDestroy {
  public mms = inject(MainMessageService);
  public SWService = inject(ServiceWorkerService);

  menuOutsideClickListener: any;

  profileMenuOutsideClickListener: any;

  appSidebar = viewChild.required<SidebarComponent>(SidebarComponent);

  appTopbar = viewChild.required<HeaderComponent>(HeaderComponent);

  constructor(
    public layoutService: LayoutService,
    public renderer: Renderer2,
    public router: Router,
    public http: HttpClient,
  ) {
    this.layoutService.overlayOpen$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen(
          'document',
          'click',
          (event) => {
            const isOutsideClicked = !(
              this.appSidebar()?.el.nativeElement.isSameNode(event.target) ||
              this.appSidebar()?.el.nativeElement.contains(event.target) ||
              this.appTopbar()?.menuButton()?.nativeElement.isSameNode(
                event.target
              ) ||
              this.appTopbar()?.menuButton()?.nativeElement.contains(event.target)
            );

            if (isOutsideClicked) {
              this.hideMenu();
            }
          }
        );
      }

      if (!this.profileMenuOutsideClickListener) {
        this.profileMenuOutsideClickListener = this.renderer.listen(
          'document',
          'click',
          (event) => {
            const isOutsideClicked = !(
              this.appTopbar()?.menu()?.nativeElement.isSameNode(event.target) ||
              this.appTopbar()?.menu()?.nativeElement.contains(event.target) ||
              this.appTopbar()?.topbarMenuButton()?.nativeElement.isSameNode(
                event.target
              ) ||
              this.appTopbar()?.topbarMenuButton()?.nativeElement.contains(
                event.target
              )
            );

            if (isOutsideClicked) {
              this.hideProfileMenu();
            }
          }
        );
      }

      if (this.layoutService.state.staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    this.router.events.pipe(
      takeUntilDestroyed(),
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.hideMenu();
      this.hideProfileMenu();
    });
  }

  test() {
    // this.http.get(environment.apiUrl + 'mecenat-reassurance').subscribe((res) => {
    //       console.log(res);
    //     });
    // this.http.get(environment.apiUrl + 'klub-dons/received-dons?populate[0]=klubr.logo&populate[1]=klubDonateur.logo&populate[2]=klubDonateur.avatar&populate[3]=klub_projet&filters[klub_projet]=43').pipe(
    // this.http.get(environment.apiUrl + 'klub-dons/received-dons?populate[0]=klubr.logo&populate[1]=klubDonateur.logo&populate[2]=klubDonateur.avatar&populate[3]=klub_projet').pipe(
    //   map((res: any) => res.data),
    //   map((results: any) => {
    //     return results.map((res: any) => (
    //         {
    //           number: res.attestationNumber,
    //           montant: res.montant,
    //           klub: res.klubr?.denomination,
    //           projet: res.klub_projet?.titre,
    //           donateur: res.klubDonateur?.email,
    //         }
    //       )
    //     )
    //   }),
    // ).subscribe((res) => {
    //   console.log(res);
    // });
    this.http.get('https://re7.donaction.fr/api/auth/session').pipe(
    ).subscribe((res) => {
      console.log(res);
    });
  }

  testPDFOpen() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf'
    });

    // this.http.post(environment.apiUrl + 'invoices/6a901fe4-b3f4-468d-8049-063862e29ae1/pdf', {}, { headers: headers, responseType: 'blob', }).pipe(
    //   openPDFInNewWindow()
    // ).subscribe();
    this.http.get(environment.apiUrl + 'klub-dons/91217ebe-e0aa-42cd-8721-8bcd0eb73725/att-pdf', {
      headers: headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      openPDFInNewWindow()
    ).subscribe();
  }

  testPDFDownload() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf'
    });

    // this.http.post(environment.apiUrl + 'invoices/6a901fe4-b3f4-468d-8049-063862e29ae1/pdf', {}, { headers: headers, responseType: 'blob', }).pipe(
    //   downloadPDF()
    // ).subscribe();

    this.http.get(environment.apiUrl + 'klub-dons/91217ebe-e0aa-42cd-8721-8bcd0eb73725/att-pdf', {
      headers: headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      downloadPDF()
    ).subscribe();
  }

  hideMenu() {
    this.layoutService.state.overlayMenuActive = false;
    this.layoutService.state.staticMenuMobileActive = false;
    this.layoutService.state.menuHoverActive = false;
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  hideProfileMenu() {
    this.layoutService.state.profileSidebarVisible = false;
    if (this.profileMenuOutsideClickListener) {
      this.profileMenuOutsideClickListener();
      this.profileMenuOutsideClickListener = null;
    }
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
    }
  }

  get containerClass() {
    return {
      'layout-theme-light': this.layoutService.config().colorScheme === 'light',
      'layout-theme-dark': this.layoutService.config().colorScheme === 'dark',
      'layout-overlay': this.layoutService.config().menuMode === 'overlay',
      'layout-static': this.layoutService.config().menuMode === 'static',
      'layout-static-inactive':
        this.layoutService.state.staticMenuDesktopInactive &&
        this.layoutService.config().menuMode === 'static',
      'layout-overlay-active': this.layoutService.state.overlayMenuActive,
      'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
      'p-input-filled': this.layoutService.config().inputStyle === 'filled',
      'p-ripple-disabled': !this.layoutService.config().ripple,
    };
  }

  ngOnDestroy() {
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }

  action(actionID: ActionId) {
    switch (actionID) {
      case 'installPwa':
        this.SWService.installPwa();
        break;
    }

  }

  reloadPage() {
    window.location.reload();
  }
}
