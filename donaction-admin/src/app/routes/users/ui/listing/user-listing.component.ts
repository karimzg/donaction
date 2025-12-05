import { Component, inject } from '@angular/core';
import { ListHeaderComponent } from "@shared/components/lists/list-header/list-header.component";
import { GenericListingComponent } from "@shared/components/generics/generic-listing/generic-listing.component";
import { UserDetail } from "@shared/utils/models/user-details";
import { UserCardComponent } from "@shared/user/user-card/user-card.component";
import { Observable } from "rxjs";
import { ApiListResult } from "@shared/utils/models/misc";
import { defaultUserPopulate, defaultUserSort, UserService } from "@shared/services/user.service";
import { UsersFiltersComponent } from "@app/routes/users/ui/users-filters/users-filters.component";
import { DeviceService } from "@shared/services/device.service";
import { UserFilters } from "@app/routes/users/model/user-filters";
import { ScrollNearEndDirective } from "@shared/utils/Directives/scroll-near-end-directive.directive";

@Component({
  selector: 'app-user-listing',
  imports: [
    ListHeaderComponent,
    UserCardComponent,
    UsersFiltersComponent,
    ScrollNearEndDirective,
  ],
  templateUrl: './user-listing.component.html',
  styleUrl: './user-listing.component.scss'
})
export class UserListingComponent extends GenericListingComponent<UserDetail, UserFilters>{
  protected override incrementalPagination = true;
  
  private userService = inject(UserService);
  private deviceService = inject(DeviceService);

  constructor() {
    super();
  }

  /* OVERRIDED METHODDS */
  protected override requestListWithFilters(klubUuid?: string | null, filters?: UserFilters, page = 1): Observable<ApiListResult<UserDetail>> {
    const pageSize = this.deviceService.isMobile() ? 10 : 50;
    return this.userService.getUsersWithFilters(filters, defaultUserPopulate, undefined, defaultUserSort, page, pageSize, true);
  }
}
