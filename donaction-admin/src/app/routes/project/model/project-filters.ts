import { ProjectStatus } from "@shared/utils/models/klubr";
import { KlubrMembre } from "@shared/utils/models/user-details";
import { ListingFilters } from "@shared/utils/models/misc";

export interface ProjectFilters extends ListingFilters {
  klubrUUIDs?: Array<string | null | 'notNull'> | null;
  invoiceLines?: Array<string | null>;
  invoicePeriod?: Array<string | null>;
  status?: Array<ProjectStatus> | null;
  member?: Partial<KlubrMembre> | null;
  isFromTemplate?: boolean | null;
  isTemplate?: boolean | null;
  projectLibrary?: string | null;
  limitDate?: Date;
}
