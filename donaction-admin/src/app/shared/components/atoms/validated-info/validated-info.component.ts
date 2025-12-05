import { Component, inject, input, output } from '@angular/core';
import { TooltipModule } from "primeng/tooltip";
import { flipAnimation } from "@shared/utils/animations/animations";
import { PermissionsService } from "@shared/services/permissions.service";
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-validated-info',
  imports: [
    TooltipModule,
    NgClass
  ],
  templateUrl: './validated-info.component.html',
  animations: [
    flipAnimation,
  ],
  styles: `
    :host {
      display: block;
      width: 22px;
      height: 22px;
      position: relative;
    }

    .pi {
      position: relative;
      left: 0;
      top: 0;
    }
  `,
  host: {
    '(click)': 'clickable() ? onclick.emit() : null',
    '[class.cursor-pointer]': 'clickable()',
  }
})
export class ValidatedInfoComponent {
  public permissionService = inject(PermissionsService);
  // true: validated, false: refused, undefined/null: waiting validation
  validated = input<boolean | undefined | null>(undefined);
  hasDoc = input<boolean>(true);
  clickable = input<boolean>(false);
  onclick = output();
}
