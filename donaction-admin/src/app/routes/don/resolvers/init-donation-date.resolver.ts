import { ResolveFn } from '@angular/router';

export const initDonationDateResolver: ResolveFn<(Date | undefined)[]> = (route, state) => {
  const dateInit = (route.queryParamMap.get('filterDonationDate') || undefined);
  const endDateInit = (route.queryParamMap.get('filterDonationDateEnd') || undefined);
  let date, endDate;

  if (dateInit) {
    date = new Date(dateInit);
    if (!endDateInit) {
      endDate = new Date(dateInit);
      endDate.setDate(endDate.getDate() + 1);
    } else {
      endDate = new Date(endDateInit);
    }
  }
  return [date, endDate];
};
