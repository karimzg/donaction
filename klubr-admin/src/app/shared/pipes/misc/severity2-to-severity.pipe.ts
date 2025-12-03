import { Pipe, PipeTransform } from '@angular/core';
import { Severity, Severity2, severity2ToSeverity } from "@shared/utils/models/misc";

@Pipe({
  name: 'severity2ToSeverity'
})
export class Severity2ToSeverityPipe implements PipeTransform {

  transform(value: Severity2): Severity {
    return severity2ToSeverity(value);
  }

}
