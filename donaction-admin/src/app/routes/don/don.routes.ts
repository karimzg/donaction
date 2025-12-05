import { DonListingComponent } from './ui/listing/don-listing.component';
import { DetailsComponent } from "./ui/details/details.component";
import { initKlubResolver } from "./resolvers/init-klub.resolver";
import { initProjectResolver } from "./resolvers/init-project.resolver";
import { initDonationStatusResolver } from "./resolvers/init-donation-status.resolver";
import { initDonationDateResolver } from "./resolvers/init-donation-date.resolver";
import { Router, Routes } from "@angular/router";
import { DonBalanceComponent } from "./ui/balance/don-balance.component";
import { inject } from "@angular/core";
import { PermissionsService } from "@shared/services/permissions.service";
import { map } from "rxjs/operators";
import { initInvoiceResolver } from "./resolvers/init-invoice.resolver";
import { MyDonationsComponent } from "./ui/my-donations/my-donations.component";
import { donationDetailsResolver } from "@app/routes/don/resolvers/donation-details.resolver";

export const routes: Routes = [
  {
    path: 'listing', component: DonListingComponent,
    resolve: {
      klubrInit: initKlubResolver,
      projectInit: initProjectResolver,
      donationStatusInit: initDonationStatusResolver,
      donationDateInit: initDonationDateResolver,
      invoiceInit: initInvoiceResolver,
    }
  },
  {
    path: 'balance',
    component: DonBalanceComponent,
    loadChildren: () => import('./ui/balance/balance.routes').then(m => m.routes),
    runGuardsAndResolvers: 'always',
    canActivateChild: [
      () => {
        const router = inject(Router);
        return inject(PermissionsService).isAtLeastLeader$.pipe(
          map(isLeader => (!isLeader) ? router.navigate(['/', 'don', 'listing']) : true),
        );
      }
    ],
  },
  {
    path: 'balance',
    component: DonBalanceComponent,
    loadChildren: () => import('./ui/balance/balance.routes').then(m => m.routes),
    runGuardsAndResolvers: 'always',
    canActivateChild: [
      () => {
        const router = inject(Router);
        return inject(PermissionsService).isAtLeastLeader$.pipe(
          map(isLeader => (!isLeader) ? router.navigate(['/', 'don', 'listing']) : true),
        );
      }
    ],
  },
  {
    path: ':uuid/details',
    component: DetailsComponent,
    resolve: {
      donation: donationDetailsResolver,
    }
  },
  {
    path: 'mes-dons', component: MyDonationsComponent,
  },
];
