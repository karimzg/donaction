import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environments/environment";
import { downloadPDF } from "@shared/utils/helpers/pdf-helpers";

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  http = inject(HttpClient);

  constructor() { }

  public getPdf(acc: number, uuid: string): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/pdf'
    });
    switch (acc) {
      case 0:
        this.http.get(environment.apiUrl + 'klub-dons/' + uuid + '/recu-pdf',
          {headers: headers, responseType: 'blob', observe: 'response'})
          .pipe(
            downloadPDF()
          ).subscribe();
        break;
      case 1:
        this.http.get(environment.apiUrl + 'klub-dons/' + uuid + '/att-pdf',
          {headers: headers, responseType: 'blob', observe: 'response'})
          .pipe(
            downloadPDF()
          ).subscribe();
        break;
    }
  }
}
