import { Pipe, PipeTransform } from '@angular/core';
import { TmplProjectCategory, TmplProjectLibrary } from "@shared/utils/models/klubr";

@Pipe({
  name: 'tmplCategory',
  standalone: true
})
export class TmplCategoryPipe implements PipeTransform {

  transform(library: Array<TmplProjectLibrary>, libraryUuid: string): Array<TmplProjectCategory> {
    return library.find((lib) => lib.uuid === libraryUuid)?.template_projects_categories! || [];
  }

}
