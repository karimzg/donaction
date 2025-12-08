import { Component, computed, input, InputSignal } from '@angular/core';
import { KlubrMembreRole, roleLabel } from "@shared/utils/models/user-details";
import { TagModule } from "primeng/tag";
import { setSeverity } from "@shared/utils/helpers/role-severity";

@Component({
  selector: 'app-role-tag',
  imports: [
    TagModule
  ],
  templateUrl: './role-tag.component.html',
  styleUrl: './role-tag.component.scss'
})
export class RoleTagComponent {
  role: InputSignal<KlubrMembreRole> = input<KlubrMembreRole>('KlubMember');
  public profileSeverity = computed(() => setSeverity(this.role()));
  public profileRoleLabel = computed(() => roleLabel(this.role()));
}
