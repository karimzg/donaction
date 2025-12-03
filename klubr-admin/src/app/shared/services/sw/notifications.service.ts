import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  setBadge(value: number) {
    try {
      navigator.setAppBadge(value);
      console.log("The Badging API is supported!");
    } catch (e) {
      console.log("The Badging API is not supported!");
    }
  }
}
