import { inject, Injectable } from '@angular/core';
import { DeviceDetectorService } from "ngx-device-detector";

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private deviceDetectorService = inject(DeviceDetectorService);

  isMobile(): boolean {
    return this.deviceDetectorService.isMobile();
  }

  isTablet(): boolean {
    return this.deviceDetectorService.isTablet();
  }

  isDesktop(): boolean {
    return this.deviceDetectorService.isDesktop();
  }

  getDeviceInfo(): any {
    return this.deviceDetectorService.getDeviceInfo();
  }

}
