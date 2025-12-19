import { Component, signal, WritableSignal } from '@angular/core';
import { MediaUpdateComponent } from "../media-update/media-update.component";
import {
  DropdownKlubMembreFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-membre-filter.component";
import { CustomDropdownItem } from "@shared/components/filters/dropdown-item-filter/dropdown-item-filter.component";
import { UpdateItemComponent } from "../update-item/update-item.component";
import { environment } from "@environments/environment";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";
import { KlubrMembre } from "@shared/utils/models/user-details";

@Component({
  selector: 'app-update-klub-membre',
  imports: [
    MediaUpdateComponent,
    DropdownKlubMembreFilterComponent,
    DropdownKlubFilterComponent
  ],
  templateUrl: './update-klub-membre.component.html',
  styleUrl: './update-klub-membre.component.scss'
})
export class UpdateKlubMembreComponent extends UpdateItemComponent<KlubrMembre, null> {
  public customDropdownItem = signal<CustomDropdownItem>({
    labelFields: ['prenom', 'nom'],
    imgField: 'avatar'
  });
  public klubrUUID: WritableSignal<string | undefined> = signal<string | undefined>(undefined);

  constructor() {
    super();
  }

  /* Item Methods*/
  protected override get itemEndpoint(): string {
    return environment.apiUrl + 'klubr-membres/' + this.itemUUID() + '?populate[0]=avatar';
  }

}
