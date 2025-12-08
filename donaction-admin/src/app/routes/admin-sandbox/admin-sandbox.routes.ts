import { UpdateKlubrComponent } from "./ui/update-klubr/update-klubr.component";
import { UpdateKlubMembreComponent } from "./ui/update-klub-membre/update-klub-membre.component";
import { UpdateKlubProjectComponent } from "./ui/update-klub-project/update-klub-project.component";
import { LottieAnimationsComponent } from "./ui/lottie-animations/lottie-animations.component";
import { UnvalidateFrontComponent } from "./ui/unvalidate-front/unvalidate-front.component";
import { EditorSandboxComponent } from "./ui/editor-sandbox/editor-sandbox.component";
import { UiSandboxComponent } from "@app/routes/admin-sandbox/ui/ui-sandbox/ui-sandbox.component";
import { PwaSandboxComponent } from "@app/routes/admin-sandbox/ui/pwa-sandbox/pwa-sandbox.component";

export const routes = [
  {
    path: 'klubr', component: UpdateKlubrComponent,
  },
  {
    path: 'klub-membres', component: UpdateKlubMembreComponent,
  },
  {
    path: 'klub-projects', component: UpdateKlubProjectComponent,
  },
  {
    path: 'lottie-animations', component: LottieAnimationsComponent,
  },
  {
    path: 'unvalidate', component: UnvalidateFrontComponent,
  },
  {
    path: 'ngx-editor', component: EditorSandboxComponent,
  },
  {
    path: 'sandbox', component: UiSandboxComponent,
  },
  {
    path: 'pwa-sandbox', component: PwaSandboxComponent,
  },
];
