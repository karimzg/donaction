import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { AvatarService } from "@shared/services/avatar.service";
import { Avatar } from "@shared/utils/models/media";
import { NgClass } from "@angular/common";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { combineLatestWith } from "rxjs";
import { tap } from "rxjs/operators";
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-avatar-pop-up',
  imports: [
    NgClass,
    ButtonModule,
  ],
  templateUrl: './avatar-pop-up.component.html',
  styleUrl: './avatar-pop-up.component.scss'
})
export class AvatarPopUpComponent implements OnInit {
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  private avatarService = inject(AvatarService);
  public avatars: WritableSignal<Array<Avatar>> = signal<Array<Avatar>>([]);
  public selectedAvatar: WritableSignal<Avatar | undefined> = signal<Avatar | undefined>(undefined);

  ngOnInit(): void {
    this.initAvatars();
    if (this.config.data.selectedAvatar) {
      this.selectedAvatar.set(this.config.data.selectedAvatar);
    }
  }

  private initAvatars(): void {
    this.avatarService.getAvatar('men').pipe(
      combineLatestWith(this.avatarService.getAvatar('women')),
      tap(([menAvatars, womenAvatars]) => {
        this.avatars.set([...menAvatars, ...womenAvatars]);
      }),
    ).subscribe();
  }

  setCurrentAvatar(avatar: Avatar): void {
    if (avatar.id !== this.selectedAvatar()?.id) {
      this.selectedAvatar.set(avatar);
    }
  }

  saveAvatar(): void {
    console.log('avatar saved');
    console.log('selected avatar', this.selectedAvatar());
    this.ref.close(this.selectedAvatar());
  }

}
