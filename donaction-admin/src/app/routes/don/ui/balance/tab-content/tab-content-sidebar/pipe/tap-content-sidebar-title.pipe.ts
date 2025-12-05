import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tapContentSidebarTitle',
  standalone: true
})
export class TapContentSidebarTitlePipe implements PipeTransform {

  transform(context: string, detailLabel?: string): unknown {
    return `Balance des dons / ${context.charAt(0).toUpperCase() + context.slice(1).toLowerCase()} ${detailLabel && ` / ${detailLabel}`}`;
  }

}
