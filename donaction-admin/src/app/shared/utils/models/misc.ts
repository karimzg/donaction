export interface EntityModel {
  readonly uuid: string;

  [x: string]: any;
}

export interface EntityIdModel {
  readonly id: number;
}

export interface EntityComponentModel extends EntityIdModel {
  readonly __component: string;
}

export interface ApiResult<T extends EntityModel> {
  data: T;
  meta: {
    pagination: MetaPagination
  };
}

export interface ApiSimpleResult<T> {
  data: T;
  meta: {
    pagination: MetaPagination
  };
}

export interface ApiListResult<T extends EntityModel> {
  data: Array<T>;
  meta: {
    pagination: MetaPagination
  };
}

export interface ApiSimpleListResult<T> {
  data: Array<T>;
  meta: {
    pagination: MetaPagination
  };
}

export interface MetaPagination {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}

export interface ListingFilters {
  searchParams?: string;
}

export type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined;
export type Severity2 = "success" | "info" | "warn" | "error" | "secondary" | "contrast" | undefined;
export const severity2ToSeverity = (severity: Severity2): Severity => {
  return severity === "error" ? "danger" : severity;
}
