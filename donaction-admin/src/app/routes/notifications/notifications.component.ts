import { Component, inject, signal } from '@angular/core';
import { Router } from "@angular/router";
import { Avatar } from "primeng/avatar";
import { Tooltip } from "primeng/tooltip";
import { NgClass } from "@angular/common";
import { LottieComponent } from "ngx-lottie";

@Component({
  selector: 'app-notifications',
  imports: [
    Avatar,
    Tooltip,
    NgClass,
    LottieComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  protected router = inject(Router);

  public allNotifications = signal<boolean>(true);

  public goBack(): void {
    this.router.navigate(['/']);
  }

  toggleAllNotifications(value: boolean) {
    this.allNotifications.set(value);
  }
}
