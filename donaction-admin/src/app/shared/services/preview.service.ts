import { inject, Injectable } from '@angular/core';
import { environment } from "@environments/environment";
import { KlubProject, Klubr } from "../utils/models/klubr";
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  protected cookieService = inject(CookieService);

  public previewClub(klub: Klubr, previewMode?: boolean) {
    if (previewMode === undefined) {
      previewMode = klub.status === 'draft';
    }
    console.log('preview club');
    if (klub?.slug) {
      const url = `${environment.nextJsUrl}${klub!.slug}${previewMode ? '?preview=true' : ''}`;
      if (previewMode) {
        console.log('openPreview', url);
        this.cookieService.set('isPreviewMode', klub!.uuid, 1000 * 60 * 60, '/');
      } else {
        this.quitPreviewMode();
      }
      window.open(url, '_blank');
    }
  }

  public previewProject(project: KlubProject, klub: Klubr, previewMode?: boolean) {
    if (previewMode === undefined) {
      previewMode = project.status === 'draft' || project.status === 'waitingApproval' || klub.status === 'draft';
    }
    console.log('preview project');
    if (klub?.slug && project?.slug) {
      const url = `${environment.nextJsUrl}${klub!.slug}/nos-projets/${project!.slug}${previewMode ? '?preview=true' : ''}`;
      if (previewMode) {
        console.log('openPreview', url);
        this.cookieService.set('isPreviewMode', klub!.uuid, 1000 * 60 * 60, '/');
      } else {
        this.quitPreviewMode();
      }
      window.open(url, '_blank');
    }
  }

  public quitPreviewMode() {
    this.cookieService.delete('isPreviewMode', '/');
  }
}
