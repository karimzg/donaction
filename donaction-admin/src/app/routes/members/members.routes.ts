import { MemberListingComponent } from "./ui/listing/member-listing.component";
import { initKlubResolver } from "@app/routes/don/resolvers/init-klub.resolver";
import { initMemberAccountResolver } from "@app/routes/members/resolvers/init-member-account.resolver";

export const routes = [
  {
    path: 'listing',
    component: MemberListingComponent,
    resolve: {
      klubrInit: initKlubResolver,
      accountInit: initMemberAccountResolver,
    }
  },
];
