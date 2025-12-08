import { ProfileComponent } from "./ui/profile/profile.component";
import { profileResolver } from "./resolvers/profile.resolver";

export const routes = [
  {
    path: '',
    component: ProfileComponent,
    resolve: {
      entity: profileResolver,
    }
  },

];
