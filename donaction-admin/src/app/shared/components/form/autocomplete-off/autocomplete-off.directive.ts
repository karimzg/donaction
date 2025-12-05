import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { userAgent } from "@shared/utils/helpers/user-agent";
import { timer } from "rxjs";
import { take, tap } from "rxjs/operators";

@Directive({
  selector: '[appAutocompleteOff]',
  standalone: true
})
export class AutocompleteOffDirective implements AfterViewInit {
  private el = inject(ElementRef);

  ngAfterViewInit(): void {
    const ua = userAgent();
    timer(200).pipe(
      take(1),
      tap(() => {
        this.el.nativeElement.setAttribute('autocomplete', (ua === 'chrome') ? 'none' : 'off');
        this.el.nativeElement.setAttribute('autocorrect', 'off');
        this.el.nativeElement.setAttribute('autocapitalize', 'none');
        this.el.nativeElement.setAttribute('spellcheck', 'false');
      })
    ).subscribe();
  }

}
