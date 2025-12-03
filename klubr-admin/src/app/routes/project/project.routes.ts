import { ProjectListingComponent } from "./ui/listing/project-listing.component";
import { ProjectUpdateComponent } from "./ui/update/project-update.component";
import { projectResolver } from "./resolvers/project.resolver";
import { NewProjectComponent } from "./ui/new-project/new-project.component";
import { hasTmplLibrairyGuard } from "@shared/utils/guards/has-tmpl-librairy.guard";
import { initKlubResolver } from "@app/routes/don/resolvers/init-klub.resolver";
import { projectStatusResolver } from "@app/routes/project/resolvers/project-status.resolver";

export const routes = [
  {
    path: 'listing',
    component: ProjectListingComponent,
    children: [
      {
        path: 'new-project', component: NewProjectComponent, outlet: 'modal',
      },
    ],
    resolve: {
      klubrInit: initKlubResolver,
      projectStatusInit: projectStatusResolver,
    }
  },
  {
    path: 'create', component: ProjectUpdateComponent,
    resolve: {
      entity: () => null,
    }
  },
  {
    path: 'create/template', component: ProjectUpdateComponent,
    data: {
      isTemplate: true
    },
    canActivate: [hasTmplLibrairyGuard],
    resolve: {
      entity: () => null,
    }
  },
  {
    path: 'create/template/:uuid', component: ProjectUpdateComponent,
    data: {
      fromTemplate: true,
    },
    resolve: {
      entity: projectResolver,
    }
  },
  {
    path: ':uuid/update', component: ProjectUpdateComponent,
    resolve: {
      entity: projectResolver
    }
  },
];
