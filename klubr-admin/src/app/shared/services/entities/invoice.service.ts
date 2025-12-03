import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiListResult } from "@shared/utils/models/misc";
import { addFilter, getQueryString, pagination, slugify } from "@shared/utils/helpers/query-helpers";
import { environment } from "@environments/environment";
import { ENDPOINTS } from "@shared/utils/config/endpoints";
import { Invoice, InvoiceGenerate, InvoiceGenerateResponse } from "@shared/utils/models/invoice";
import { CachingService } from "../caching.service";
import { downloadPDF, openPDFInNewWindow } from "@shared/utils/helpers/pdf-helpers";
import { InvoiceFilters } from "@app/routes/facturation/model/invoice-filters";
import { isNotNullOrUndefined } from "@shared/utils/helpers/type-helpers";

export const defaultInvoiceSort = ['createdAt:desc'];
export const defaultInvoicePopulate = ['invoice_lines.klub_projet', 'klubr.logo', 'klubr.trade_policy'];

/* CLEANED ON 2024 12 28 */

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private cachingService = inject(CachingService);

  public downloadInvoice(invoiceUUid: string, invoiceNumber?: string, action: 'open' | 'download' = 'download'): void {
    const endpoint = environment.apiUrl + 'invoices/' + invoiceUUid + '/pdf';
    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf'
    });
    const request = this.http.get(endpoint, {headers: headers, responseType: 'blob', observe: 'response'});
    this.cachingService.cacheObservable<any>(endpoint, request).pipe(
      action === 'open' ? openPDFInNewWindow() : downloadPDF('facture-' + slugify(invoiceNumber || 'klubr') + '.pdf')
    ).subscribe();
  }

  // Facturation
  public generateInvoices(form: InvoiceGenerate, uuid: string | undefined): Observable<InvoiceGenerateResponse> {
    let mail = form.pdf ? form.mail : false;
    // return of(invoiceGenerateResponse);
    return this.http.get<InvoiceGenerateResponse>(
      environment.apiUrl +
      ENDPOINTS.INVOICES + '/' +
      (uuid ? uuid + '/' : '') +
      'generate/' +
      form.billingPeriodSmall.month + '/' +
      form.billingPeriodSmall.year + '/' +
      form.pdf + '/' +
      mail
    );
  }

  public getInvoices(filters?: InvoiceFilters, populateArray = defaultInvoicePopulate, additionalQueryParams?: string, sortArray = defaultInvoiceSort, page = 1, pageSize = 20): Observable<ApiListResult<Invoice>> {
    const queryArray: Array<string> = [];
    if (filters !== undefined) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as keyof InvoiceFilters];
        if (isNotNullOrUndefined(value)) {
          switch (key) {
            case ('billingPeriodSmall'):
              const date: { month: string; year: string; } = filters.billingPeriodSmall!;
              const period = date!.year + '/' + date!.month;
              queryArray.push(addFilter('billingPeriodSmall', '$eq', period));
              break;
            case ('klubrUUIDs'):
              (value as string[]).forEach((uuid) => {
                queryArray.push(addFilter('klubr', 'uuid', uuid));
              })
              break;
            case ('searchParams'):
              if (typeof value === 'string' && value.length > 0) {
                queryArray.push(addFilter('invoiceNumber', '$containsi', value));
              }
              break;
            case ('invoicePdfPath'):
              queryArray.push(addFilter('invoicePdfPath', value ? '$notNull' : '$null', 'true'));
              break;
            case ('firstSentEmailDate'):
              queryArray.push(addFilter('firstSentEmailDate', value ? '$notNull' : '$null', 'true'));
              break;
            default:
              break;
          }
        }
      });
    }

    return this.http.get<ApiListResult<Invoice>>(
      environment.apiUrl +
      ENDPOINTS.INVOICES + '/' +
      getQueryString(queryArray, populateArray, additionalQueryParams, sortArray, pagination(page, pageSize)),
    );
  }

  public sendInvoice(invoiceUUid: string): Observable<Array<{ email: string, fullName: string }>> {
    return this.http.get<Array<{ email: string, fullName: string }>>(
      environment.apiUrl +
      ENDPOINTS.INVOICES +
      '/' +
      invoiceUUid +
      '/send',
    );
  }
}
