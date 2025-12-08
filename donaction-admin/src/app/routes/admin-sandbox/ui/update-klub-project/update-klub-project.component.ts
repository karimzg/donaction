import { Component, signal, WritableSignal } from '@angular/core';
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import { MediaUpdateComponent } from "../media-update/media-update.component";
import { UpdateItemComponent } from "../update-item/update-item.component";
import { KlubProject } from "@shared/utils/models/klubr";
import { environment } from "@environments/environment";
import {
  DropdownProjectFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-project-filter.component";

@Component({
  selector: 'app-update-klub-project',
  imports: [
    DropdownKlubFilterComponent,
    MediaUpdateComponent,
    DropdownProjectFilterComponent,
  ],
  templateUrl: './update-klub-project.component.html',
  styleUrl: './update-klub-project.component.scss'
})
export class UpdateKlubProjectComponent extends UpdateItemComponent<KlubProject, null> {

  public klubrUUID: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  constructor() {
    super();
  }

  /* Item Methods*/
  protected override get itemEndpoint(): string {
    return environment.apiUrl + 'klub-projets/' + this.itemUUID() + '?populate[0]=couverture';
  }
}
