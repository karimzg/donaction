import { Directive, ElementRef, HostListener, input, Optional } from '@angular/core';
import { FormGroupDirective } from "@angular/forms";
import { InvalidControlScrollContainerDirective } from "./invalid-control-scroll-container.directive";
import { fromEvent } from "rxjs";
import { debounceTime, take } from "rxjs/operators";

@Directive({
  selector: '[appInvalidControlScroll]',
  standalone: true
})
export class InvalidControlScrollDirective {
  labelOffset = input(120);

  private get containerEl(): HTMLElement | Window {
    return this.scrollContainerDir
      ? this.scrollContainerDir.containerEl
      : window;
  }

  constructor(
    private el: ElementRef,
    private formGroupDir: FormGroupDirective,
    @Optional()
    private scrollContainerDir: InvalidControlScrollContainerDirective
  ) {
  }

  @HostListener("ngSubmit") onSubmit() {
    if (this.formGroupDir.control.invalid) {
      this.scrollToFirstInvalidControl();
    }
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      ".ng-invalid"
    );

    this.containerEl.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth"
    });

    fromEvent(this.containerEl, "scroll").pipe(
      debounceTime(100),
      take(1)
    ).subscribe(() => firstInvalidControl.focus());
  }

  private getTopOffset(controlEl: HTMLElement): number {
    // const labelOffset = 120;
    const controlElTop = controlEl.getBoundingClientRect().top;

    if (this.scrollContainerDir) {
      const containerTop = (this.containerEl as HTMLElement).getBoundingClientRect().top;
      const absoluteControlElTop = controlElTop + (this.containerEl as HTMLElement).scrollTop;

      return absoluteControlElTop - containerTop - this.labelOffset();
    } else {
      const absoluteControlElTop = controlElTop + window.scrollY;

      return absoluteControlElTop - this.labelOffset();
    }
  }
}
