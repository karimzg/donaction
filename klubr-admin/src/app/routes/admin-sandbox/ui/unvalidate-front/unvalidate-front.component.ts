import { Component, inject, signal } from '@angular/core';
import { MultiSelectModule } from "primeng/multiselect";
import { FormsModule } from "@angular/forms";
import { FrontCacheTags } from "@shared/utils/models/front-cache";
import { CardModule } from "primeng/card";
import { Button } from "primeng/button";
import { InvalidateCacheService } from "@shared/services/invalidate-cache.service";
import { ToastService } from "@shared/services/misc/toast.service";
import { AutoCompleteModule } from "primeng/autocomplete";

@Component({
  selector: 'app-unvalidate-front',
  imports: [
    FormsModule,
    MultiSelectModule,
    CardModule,
    Button,
    // ChipsModule,
    AutoCompleteModule,
  ],
  templateUrl: './unvalidate-front.component.html',
  styleUrl: './unvalidate-front.component.scss'
})
export class UnvalidateFrontComponent {
  private invalidateCacheService = inject(InvalidateCacheService);
  private toastService = inject(ToastService);
  tags: Array<{ code: FrontCacheTags, label: string }> = Object.values(FrontCacheTags).map((tag) => {
    return {
      code: tag,
      label: FrontCacheTags[tag]
    };
  });
  selectedTags!: Array<{ code: FrontCacheTags, label: string }>;
  paths: Array<string> = [];
  isLoading = signal(false);

  constructor() {
  }

  submit(): void {
    const paths = this.paths?.length > 0 ? this.paths : undefined;
    const tags = this.selectedTags?.length ? this.selectedTags.map((tag) => tag.code) : undefined;
    this.isLoading.set(true);
    this.invalidateCacheService.unvalidateCache(paths, tags).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        const detail = (data.message.paths ?? `Paths: ${data.message.paths}`) + (data.message.tags ?? `\nTags: ${data.message.tags}`);
        this.toastService.showSuccessToast('Succès', detail)
      },
      error: (error) => {
        this.toastService.showErrorToast('Erreur', error.message);
        this.isLoading.set(false);
      },
    });
  }
}
