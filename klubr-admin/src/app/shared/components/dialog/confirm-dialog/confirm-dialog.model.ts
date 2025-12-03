import { Confirmation } from "primeng/api";
import { Severity2 } from "@shared/utils/models/misc";

export interface ConfirmationWrapper extends Confirmation {
  alertMsg?: { severity: Severity2, text: string };
}
