import { klubHouseResolver } from "./resolvers/klub-house.resolver";
import { KlubHouseUpdateComponent } from "./klub-house-update/klub-house-update.component";

export const routes = [
  // {
  //   path: '',
  //   component: KlubHouseDetailComponent,
  // },
  {
    path: ':uuid/update',
    component: KlubHouseUpdateComponent,
    resolve: {
      entity: klubHouseResolver,
    }
  }
];
