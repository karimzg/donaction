import { Pipe, PipeTransform } from '@angular/core';
import { KlubProject } from "@shared/utils/models/klubr";
import { Status, STATUS, STATUS_VALUES } from "../model/status-rules";

@Pipe({
  name: 'projectStatus',
  standalone: true
})
export class ProjectStatusPipe implements PipeTransform {

  transform(project: KlubProject): STATUS_VALUES {
    return STATUS.find((s: Status) => s.apiKey === project?.status)?.key || STATUS_VALUES.DRAFT
  }

}
