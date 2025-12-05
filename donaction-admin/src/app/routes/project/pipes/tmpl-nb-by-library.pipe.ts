import { Pipe, PipeTransform } from '@angular/core';
import { TmplProjectLibrary } from "@shared/utils/models/klubr";

@Pipe({
  name: 'tmplNbByLibrary',
  standalone: true
})
export class TmplNbByLibraryPipe implements PipeTransform {

  transform(library: TmplProjectLibrary): number {
    return library?.template_projects_categories?.reduce((acc, category) => {
      return acc + (category?.klub_projets?.length || 0);
    }, 0) || 0;
  }

}
