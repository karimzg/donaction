import { Component, } from '@angular/core';
import { environment } from "@environments/environment";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { FileUploadModule } from "primeng/fileupload";
import { Klubr, KlubrHouse } from "@shared/utils/models/klubr";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MediaUpdateComponent } from "../media-update/media-update.component";
import { UpdateItemComponent } from "../update-item/update-item.component";
import {
  DropdownKlubFilterComponent
} from "@shared/components/filters/dropdown-item-filter/children/dropdown-klub-filter.component";

@Component({
  selector: 'app-update-klubr',
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule,
    FileUploadModule,
    ReactiveFormsModule,
    FormsModule,
    MediaUpdateComponent,
    DropdownKlubFilterComponent
  ],
  templateUrl: './update-klubr.component.html',
  styleUrl: './update-klubr.component.scss'
})
export class UpdateKlubrComponent extends UpdateItemComponent<Klubr, KlubrHouse> {

  constructor() {
    super();
  }

  /* Item Methods*/
  protected override get itemEndpoint(): string {
    return environment.apiUrl + 'klubrs/' + this.itemUUID() + '?populate[0]=klubr_house&populate[1]=klub_projets.klubr_membre&populate[2]=logo&populate[3]=poster_media';
  }

  protected override getSubItemEndpoint(item: Klubr): string | null {
    return item.klubr_house?.uuid
      ? environment.apiUrl + 'klubr-houses/' + item.klubr_house.uuid + '?populate[0]=couvertureMedia&populate[1]=club_presentation.image&populate[2]=partnerList.logo&populate[3]=chiffres&populate[4]=poster_media'
      : null;
  }

}
