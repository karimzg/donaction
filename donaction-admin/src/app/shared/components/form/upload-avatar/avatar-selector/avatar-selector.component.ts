import { Component, ElementRef, inject, input, linkedSignal, output, ViewChild } from '@angular/core';
import { take } from "rxjs/operators";
import { AvatarPopUpComponent } from "../avatar-pop-up/avatar-pop-up.component";
import { filter } from "rxjs";
import { Media } from "@shared/utils/models/media";
import { SharedFacade } from "@shared/data-access/+state/shared.facade";
import { FormsModule } from "@angular/forms";
import { DialogService } from "primeng/dynamicdialog";
import { AvatarModule } from "primeng/avatar";
import { ToastModule } from "primeng/toast";
import { DialogModule } from "primeng/dialog";
import { MediaPipe } from "@shared/pipes/media/media.pipe";
import { Popover } from "primeng/popover";

@Component({
  selector: 'app-avatar-selector',
  imports: [
    AvatarModule,
    ToastModule,
    FormsModule,
    Popover,
    DialogModule,
    MediaPipe,
  ],
  providers: [DialogService, MediaPipe],
  templateUrl: './avatar-selector.component.html',
  styleUrl: './avatar-selector.component.scss'
})
export class AvatarSelectorComponent {
  public sharedFacade = inject(SharedFacade);
  public dialogService = inject(DialogService);

  public avatar = input<Partial<Media> | undefined>(undefined);
  public currentAvatar = linkedSignal(this.avatar);
  fileSelected = output<File>();
  avatarSelected = output<Media>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /* FILE UPLOAD METHODS */
  openFileDialog(op: Popover) {
    op.hide();
    this.fileInput.nativeElement.click();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileSelected.emit(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.currentAvatar.set({url: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  }

  /* SELECT AVATAR METHODS */
  show(op: Popover) {
    op.hide();
    const ref = this.dialogService.open(AvatarPopUpComponent, {
      header: 'Selectionnez un avatar',
      width: '630px',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      data: {
        selectedAvatar: this.currentAvatar()?.id && this.currentAvatar(),
      }
    });

    ref?.onClose.pipe(
      take(1),
      filter((avatar: Media) => !!avatar),
    ).subscribe({
      next: (avatar: Media) => {
        this.currentAvatar.set(avatar);
        this.avatarSelected.emit(avatar);
      }
    });
  }

}
