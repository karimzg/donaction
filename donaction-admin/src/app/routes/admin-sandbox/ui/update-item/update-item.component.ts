import { Component, DestroyRef, effect, inject, signal, WritableSignal, } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { switchMap, take, tap } from "rxjs/operators";

import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { EMPTY, Observable } from "rxjs";
import { FileUploadModule } from "primeng/fileupload";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: 'app-update-klubr',
    imports: [
    ButtonModule,
    RippleModule,
    FileUploadModule,
    ReactiveFormsModule,
    FormsModule
],
    template: ''
})
export class UpdateItemComponent<T, U> {
  protected http = inject(HttpClient);
  protected readonly destroyRef = inject(DestroyRef);
  protected itemUUID: WritableSignal<string | undefined> = signal(undefined);
  protected item: WritableSignal<T | undefined> = signal(undefined);
  public subItem: WritableSignal<U | undefined> = signal(undefined);

  constructor() {
    effect(() => {
      if (this.itemUUID()) {
        this.updateItem();
      }
    });
  }

  /* Item Methods*/
  public updateItem() {
    this.getItem().pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((item) => this.getSubItem(item)),
    ).subscribe();
  }

  public updateSubItem() {
    this.getSubItem(this.item()!).subscribe();
  }

  private getItem(index = 0): Observable<T> {
    return this.http.get<T>(this.itemEndpoint).pipe(
      take(1),
      tap((res) => {
        this.item.set(res);
      }),
    );
  }

  protected get itemEndpoint(): string {
    return '';
  }

  private getSubItem(item: T, index = 0): Observable<U> {
    const endpoint = this.getSubItemEndpoint(item);
    return endpoint
      ? this.http.get<U>(endpoint).pipe(
        take(1),
        tap((res) => {
          this.subItem.set(res);
        }),
      )
      : EMPTY;
  }

  protected getSubItemEndpoint(item: T): string | null {
    return null;
  }
}
