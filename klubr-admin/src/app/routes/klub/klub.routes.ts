import { LegalInformationComponent } from "./ui/legal-information/legal-information.component";
import { legalInformationsResolver } from "./resolvers/legal-informations.resolver";
import { LegalDocumentComponent } from "./ui/legal-document/legal-document.component";
import { legalDocumentsResolver } from "./resolvers/legal-documents.resolver";
import { KlubListingComponent } from "@app/routes/klub/ui/listing/klub-listing.component";
import { isAdminGuard } from "@shared/utils/guards/is-admin.guard";

export const routes = [
  {
    path: ':uuid/infos-legales',
    component: LegalInformationComponent,
    resolve: {
      entity: legalInformationsResolver,
    }
  },
  {
    path: ':uuid/documents',
    component: LegalDocumentComponent,
    resolve: {
      entity: legalDocumentsResolver,
    }
  },
  {
    path: 'listing',
    component: KlubListingComponent,
    canActivate: [isAdminGuard],
  },
];
