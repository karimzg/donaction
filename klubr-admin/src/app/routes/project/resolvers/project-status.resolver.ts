import { ResolveFn } from '@angular/router';
import { of } from "rxjs";
import { Status, STATUS } from "@shared/components/project/project-state-dropdown/model/status-rules";
import { ProjectStatus } from "@shared/utils/models/klubr";

export const projectStatusResolver: ResolveFn<Array<ProjectStatus> | undefined> = (route, state) => {
  const statusInit = (route.queryParamMap.get('filterProjectStatus') || undefined);
  let status;
  if (statusInit) {
    status = STATUS.find((status: Status) => status.apiKey === statusInit)?.apiKey;
  }
  return status ? [status] : of(undefined);
};
