import { Pipe, PipeTransform } from '@angular/core';
import { Klubr } from "@shared/utils/models/klubr";

@Pipe({
  name: 'lastUpdatedAt'
})
export class LastUpdatedAtPipe implements PipeTransform {

  transform(klub: Klubr): Date | null {
    const defaultDate = '1970-01-01T00:00:00.000Z';
    const lastUpdatedAt = klub?.updatedAt || klub?.createdAt || defaultDate;
    const lastUpdatedAtDocs = klub?.klubr_document?.updatedAt || klub?.klubr_document?.createdAt || defaultDate;
    const lastUpdatedAtInfos = klub?.klubr_info?.updatedAt || klub?.klubr_info?.createdAt || defaultDate;
    const lastUpdatedAtKlubHouse = klub?.klubr_house?.updatedAt || klub?.klubr_house?.createdAt || defaultDate;
    if (lastUpdatedAt && lastUpdatedAtDocs && lastUpdatedAtInfos && lastUpdatedAtKlubHouse) {
      console.log('lastUpdatedAt', new Date(lastUpdatedAt).getTime(), new Date(lastUpdatedAtDocs).getTime(), new Date(lastUpdatedAtInfos).getTime(), new Date(lastUpdatedAtKlubHouse).getTime());
      return new Date(Math.max(new Date(lastUpdatedAt).getTime(), new Date(lastUpdatedAtDocs).getTime(), new Date(lastUpdatedAtInfos).getTime(), new Date(lastUpdatedAtKlubHouse).getTime()));
    }
    return null;
  }

}
