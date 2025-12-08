import {
  Component,
  effect,
  inject,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FormErrorHandlingService } from '@shared/services/form-error-handling.service';
import { CommonModule } from '@angular/common';
import { distinctUntilChanged, tap } from "rxjs/operators";
import { Subscription } from "rxjs";
import { AbstractControlWarn } from "@shared/utils/validators/warning/warning.validator";

@Component({
  selector: 'app-error-display',
  imports: [CommonModule],
  template: ` @if (shouldDisplayError()) {
    <small class="p-error flex"><i class="pi pi-exclamation-circle mr-1"></i>{{ errorMessage() }}</small>
  }
  @if (shouldDisplayWarning() && !shouldDisplayError()) {
    <small class="p-warn flex"><i class="pi pi-info-circle mr-1"></i>Conseil:&nbsp;{{ warningMessage() }}</small>
  }`,
  styles: []
})
export class ErrorDisplayComponent implements OnInit, OnDestroy {
  private errorHandlingService = inject(FormErrorHandlingService);
  control: InputSignal<AbstractControl | AbstractControlWarn | undefined> = input<AbstractControl | AbstractControlWarn | undefined>(undefined)
  handleWarnings: InputSignal<boolean> = input<boolean>(false)
  isSubmitted: InputSignal<boolean> = input<boolean>(false)
  shouldDisplayError: WritableSignal<boolean> = signal<boolean>(false);
  shouldDisplayWarning: WritableSignal<boolean> = signal<boolean>(false);
  errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  warningMessage: WritableSignal<string | null> = signal<string | null>(null);
  private subscription: Subscription = new Subscription();

  constructor() {
    effect(() => {
      if (this.isSubmitted()) {
        this.handleError();
      }
    });
  }

  ngOnInit() {
    this.subscription.add(this.control()!.statusChanges.pipe(
      tap(() => this.handleWarnings() && this.handleWarning()),
      distinctUntilChanged(),
      tap(() => this.handleError()),
    ).subscribe());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  handleError() {
    this.shouldDisplayError.set((this.control()!.dirty || this.isSubmitted()) && this.control()!.invalid);
    this.errorMessage.set(this.errorHandlingService.getErrorMessage(this.control()!));
  }

  handleWarning() {
    const warningControl = this.control() as AbstractControlWarn;
    this.shouldDisplayWarning.set((this.control()!.dirty || this.isSubmitted()) && warningControl!.warnings);
    this.warningMessage.set(this.errorHandlingService.getWarningMessage(warningControl!));
  }
}
