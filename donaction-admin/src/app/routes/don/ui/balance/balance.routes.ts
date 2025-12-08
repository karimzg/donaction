import { TabContentComponent } from "./tab-content/tab-content.component";
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: 'club',
    component: TabContentComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'projets',
    component: TabContentComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'factures',
    component: TabContentComponent,
    runGuardsAndResolvers: 'always',
  },
  {path: '', redirectTo: 'club', pathMatch: 'full'}
];
