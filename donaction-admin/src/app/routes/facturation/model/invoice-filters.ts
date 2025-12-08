export interface InvoiceFilters {
  billingPeriodSmall: { month: string, year: string, currentMonth?: boolean | undefined } | undefined;
  klubrUUIDs?: string[] | null;
  searchParams?: string | undefined;
  invoicePdfPath?: boolean | null;
  firstSentEmailDate?: boolean | null;
}
