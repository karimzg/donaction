# Angular 21 Migration Inventory

## Components with FormGroup (26 files)
These components use reactive forms and may be candidates for Signal Forms migration:

1. src/app/routes/members/ui/invitation-pop-up/invitation-pop-up.component.ts
2. src/app/shared/components/contact-form/contact-form.component.ts
3. src/app/shared/components/member/link-member/link-member.component.ts
4. src/app/shared/components/project/project-change-limit-date/project-change-limit-date.component.ts
5. src/app/shared/components/filters/dropdown-item-filter/dropdown-item-filter.component.ts
6. src/app/shared/components/generics/generic-filters/generic-filters.component.ts
7. src/app/shared/components/generics/generic-listing/generic-listing.component.ts
8. src/app/shared/components/generics/generic-update/generic-update.component.ts
9. src/app/shared/components/lists/list-header/list-header.component.ts
10. src/app/routes/klub/ui/klub-filters/klub-filters.component.ts
11. src/app/routes/klub/ui/legal-document/legal-document.component.ts
12. src/app/routes/klub/ui/legal-information/legal-information.component.ts
13. src/app/routes/profile/ui/profile/profile.component.ts ⭐ (MIGRATION TARGET)
14. src/app/routes/admin-sandbox/ui/editor-sandbox/editor-sandbox.component.ts
15. src/app/routes/members/ui/member-filters/member-filters.component.ts
16. src/app/routes/members/ui/member-update/member-update.component.ts
17. src/app/routes/project/ui/project-filters/project-filters.component.ts
18. src/app/routes/project/ui/update/project-update.component.ts
19. src/app/routes/don/ui/don-filters/don-filters.component.ts
20. src/app/routes/klub-house/klub-house-update/klub-house-update.component.ts
21. src/app/routes/auth/ui/login/login.component.ts
22. src/app/routes/auth/ui/register/register.component.ts
23. src/app/routes/edit-account/edit-account.component.ts
24. src/app/routes/facturation/ui/generation/generation.component.ts
25. src/app/routes/facturation/ui/invoice-filters/invoice-filters.component.ts
26. src/app/routes/users/ui/users-filters/users-filters.component.ts

## Components with @Input() decorator (4 files)
To migrate to `input()` signal API:

1. src/app/shared/utils/Directives/scroll-near-end-directive.directive.ts
2. src/app/shared/components/form/editor/editor.component.ts
3. src/app/shared/components/member/link-member/link-member.component.ts
4. src/app/shared/components/app-menu.component.ts

## Components with @ViewChild() decorator (12 files)
To migrate to `viewChild()` signal API:

1. src/app/routes/dashboard/dashboard.component.ts
2. src/app/shared/components/form/form-media-update/form-media-update.component.ts
3. src/app/shared/components/form/sections-strapi/section-txt-img/section-txt-img.component.ts
4. src/app/shared/components/form/upload-avatar/avatar-selector/avatar-selector.component.ts
5. src/app/shared/components/medias/informations-image-card/informations-image-card.component.ts
6. src/app/shared/components/member/link-member/link-member.component.ts
7. src/app/shared/components/project/project-state-dropdown/project-state-dropdown.component.ts
8. src/app/shared/components/generics/generic-listing/generic-listing.component.ts
9. src/app/shared/components/generics/generic-update/generic-update.component.ts
10. src/app/shared/components/header/header.component.ts
11. src/app/shared/user/user-card/user-card.component.ts
12. src/app/routes/klub-house/klub-house-update/klub-house-update.component.ts

## Components with OnDestroy lifecycle (8 files)
Using manual cleanup - to migrate to `takeUntilDestroyed()`:

1. src/app/routes/dashboard/dashboard.component.ts
2. src/app/shared/components/form/editor/editor.component.ts
3. src/app/shared/components/form/error-display/error-display.component.ts
4. src/app/shared/components/form/sections-strapi/section-txt-img/section-txt-img.component.ts
5. src/app/shared/components/member/link-member/link-member.component.ts
6. src/app/shared/components/app-menu.component.ts
7. src/app/routes/admin-sandbox/ui/editor-sandbox/editor-sandbox.component.ts
8. src/app/routes/auth/ui/register/register.component.ts

## Components with takeUntil pattern (10 files)
Already identified in plan - to migrate to `takeUntilDestroyed()`:

1. src/app/routes/dashboard/dashboard.component.ts
2. src/app/shared/services/analytics/analytics.service.ts
3. src/app/shared/services/layout.services.ts
4. src/app/shared/services/menu.service.ts
5. src/app/shared/components/form/form-media-update/form-media-update.component.ts
6. src/app/shared/components/form/google-maps/google-maps-api.service.ts
7. src/app/shared/components/form/google-maps/google-place-autocomplete.directive.ts
8. src/app/shared/components/medias/image-cropper-dialog/image-cropper-dialog-footer/image-cropper-dialog-footer.component.ts
9. src/app/shared/components/medias/image-cropper-dialog/image-cropper-dialog.component.ts
10. src/app/shared/components/medias/informations-image-card/informations-image-card.component.ts

## Migration Priority

### High Priority (Phase 3)
- ProfileComponent (Signal Forms migration target)
- GenericUpdateComponent (affects all CRUD forms)

### Medium Priority (Phase 4)
- All @Input() conversions (4 files)
- All @ViewChild() conversions (12 files)
- All takeUntil conversions (10 files)

### Low Priority (Post-migration)
- Remaining FormGroup components (25 files) - migrate as needed

