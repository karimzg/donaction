import { ResolveFn } from '@angular/router';
import { of } from "rxjs";
import { donationStatus } from "../model/don-filters";

export const initDonationStatusResolver: ResolveFn<{ label: string, code: string } | undefined> = (route, state) => {
  const statusInit = (route.queryParamMap.get('filterDonationStatus') || undefined);
  let status;
  if (statusInit) {
    status = donationStatus.find((status: { label: string, code: string }) => status.code === statusInit);
  }
  return status || of(undefined);
};
