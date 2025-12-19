import { ResolveFn } from '@angular/router';
import { of } from "rxjs";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "@shared/utils/config/endpoints";
import { Invoice } from "@shared/utils/models/invoice";

export const initInvoiceResolver: ResolveFn<Invoice | undefined | null> = (route, state) => {
  const InvoiceUUIDInit = (route.queryParamMap.get('filterInvoiceUuid') || undefined);
  return InvoiceUUIDInit === 'null' ?
    of(null) : (InvoiceUUIDInit ? getInvoiceByUUID(InvoiceUUIDInit) : of(undefined));
};

const getInvoiceByUUID = (invoiceUUID: string) => {
  const http = inject(HttpClient);
  return http.get<Invoice>(environment.apiUrl + ENDPOINTS.INVOICES + '/' + invoiceUUID);
};
