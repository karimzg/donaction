import { inject, Injectable } from '@angular/core';
import { MessageService } from "primeng/api";

export type TOAST_KEY = 'global-toast' | 'global-quick-toast' | 'keep-while-routing';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private msgService = inject(MessageService);

  STICKY: boolean = false;

  showSuccessToast(summary: string, detail: string, key?: TOAST_KEY): void {
    this.showToast(summary, detail, 'success', key);
  }

  showInfoToast(summary: string, detail: string, key?: TOAST_KEY): void {
    this.showToast(summary, detail, 'info', key);
  }

  showWarnToast(summary: string, detail: string, key?: TOAST_KEY): void {
    this.showToast(summary, detail, 'warn', key);
  }

  showErrorToast(summary: string, detail: string, key?: TOAST_KEY): void {
    this.showToast(summary, detail, 'error', key);
  }

  showToast(
    summary: string,
    detail: string,
    severity: string,
    key: TOAST_KEY = 'global-toast',
  ): void {
    this.msgService.add({
      key,
      severity: severity,
      summary: summary,
      detail: detail,
      sticky: this.STICKY
    });
  }

  clearAllToasts(): void {
    this.msgService.clear('global-toast');
    this.msgService.clear('global-quick-toast');
  }
}
