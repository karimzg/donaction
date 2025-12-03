import { Routes } from "@angular/router";
import { GenerationComponent } from "./ui/generation/generation.component";
import { ManageComponent } from "./ui/manage/manage.component";
import { initKlubResolver } from "@app/routes/don/resolvers/init-klub.resolver";

export const routes: Routes = [
  {
    path: 'generer', component: GenerationComponent,
  },
  {
    path: 'gerer', component: ManageComponent,
    resolve: {
      klubrInit: initKlubResolver,
    }
  },
];
