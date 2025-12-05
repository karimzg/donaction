import { Observable } from "rxjs";
import { HttpResponse } from "@angular/common/http";

const getFileNameFromContentDisposition = (contentDisposition: string): string => {
  const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
  let filename = 'file.pdf';
  if (matches != null && matches[1]) {
    filename = matches[1].replace(/['"]/g, '');
  }
  return filename;
}
export function openPDFInNewWindow(blobParts?: HttpResponse<BlobPart>): (source: Observable<HttpResponse<BlobPart>>) => Observable<HttpResponse<BlobPart>> {
  return (source: Observable<HttpResponse<BlobPart>>) => new Observable<HttpResponse<BlobPart>>(observer => {
    source.subscribe({
      next(value) {
        if (value.body instanceof Blob) {
          const blob = new Blob([value.body], {type: 'application/pdf'});
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        } else {
          observer.error('Response body is not a Blob');
        }
      },
      error(err) {
        observer.error(err);
      },
    });
  });
};

export function downloadPDF(fileName?: string /*blobParts?: HttpResponse<BlobPart>*/): (source: Observable<HttpResponse<BlobPart>>) => Observable<HttpResponse<BlobPart>> {
  return (source: Observable<HttpResponse<BlobPart>>) => new Observable<HttpResponse<BlobPart>>(observer => {
    source.subscribe({
      next(value) {
        if (value.body instanceof Blob) {
          const blob = new Blob([value.body], {type: 'application/pdf'});
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          let name = fileName ? `attachment; filename="${fileName}"` : 'file.pdf' ;
          try {
            name = value?.headers?.get('Content-Disposition') || name;
          } catch (error) {
          }

          const contentDisposition = name;
          link.download = getFileNameFromContentDisposition(contentDisposition);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          observer.error('Response body is not a Blob');
        }
      },
      error(err) {
        observer.error(err);
      },
    });
  });
};
