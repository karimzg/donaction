import { Component, computed, model } from '@angular/core';
import { roleLabel, UserRole } from "@shared/utils/models/user-details";
import { Tag } from "primeng/tag";
import { setSeverity } from "@shared/utils/helpers/role-severity";

@Component({
  selector: 'app-user-role-tag',
  imports: [
    Tag
  ],
  templateUrl: './user-role-tag.component.html',
  styleUrl: './user-role-tag.component.scss'
})
export class UserRoleTagComponent {
  role = model.required<UserRole>();
  public userSeverity = computed(() => setSeverity(this.role()));
  public userRoleLabel = computed(() => roleLabel(this.role()));
}
