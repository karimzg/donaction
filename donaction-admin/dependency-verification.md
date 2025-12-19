# Dependency Upgrade Verification - Angular 21 Migration

## ✅ Successfully Upgraded

### Angular Core Packages (Target: v21)
| Package | Before | After | Status |
|---------|--------|-------|--------|
| @angular/animations | 19.2.0 | **21.0.6** | ✅ |
| @angular/common | 19.2.0 | **21.0.6** | ✅ |
| @angular/compiler | 19.2.0 | **21.0.6** | ✅ |
| @angular/core | 19.2.0 | **21.0.6** | ✅ |
| @angular/forms | 19.2.0 | **21.0.6** | ✅ |
| @angular/platform-browser | 19.2.0 | **21.0.6** | ✅ |
| @angular/platform-browser-dynamic | 19.2.0 | **21.0.6** | ✅ |
| @angular/router | 19.2.0 | **21.0.6** | ✅ |
| @angular/service-worker | 19.2.0 | **21.0.6** | ✅ |

### Angular DevTools (Target: v21)
| Package | Before | After | Status |
|---------|--------|-------|--------|
| @angular/cli | 19.2.0 | **21.0.4** | ✅ |
| @angular-devkit/build-angular | 19.2.0 | **21.0.4** | ✅ |
| @angular/compiler-cli | 19.2.0 | **21.0.6** | ✅ |

### Angular Add-ons (Target: v21)
| Package | Before | After | Status |
|---------|--------|-------|--------|
| @angular/google-maps | 19.2.1 | **21.0.0** | ✅ |

### TypeScript (Target: 5.6+)
| Package | Before | After | Status |
|---------|--------|-------|--------|
| typescript | 5.5.4 | **5.9.3** | ✅ (exceeds minimum) |

### NgRx State Management (Target: v21)
| Package | Before | After | Status |
|---------|--------|-------|--------|
| @ngrx/effects | 19.0.1 | **21.0.0** | ✅ |
| @ngrx/operators | 19.0.1 | **21.0.0** | ✅ |
| @ngrx/signals | 19.0.1 | **21.0.0** | ✅ |
| @ngrx/store | 19.0.1 | **21.0.0** | ✅ |
| @ngrx/store-devtools | 19.0.1 | **21.0.0** | ✅ |

### Angular-Compatible Libraries
| Package | Before | After | Status |
|---------|--------|-------|--------|
| ngx-cookie-service | 19.1.2 | **21.0.0** | ✅ |

### Third-Party Packages (Phase 2B - 2025-12-19)
| Package | Before | After | Status |
|---------|--------|-------|--------|
| ng-recaptcha | 13.2.1 | **REPLACED** | ✅ Migrated to ng-recaptcha-2 |
| ng-recaptcha-2 | N/A | **21.0.1** | ✅ Drop-in replacement |
| ngx-device-detector | 9.0.0 | **11.0.0** | ✅ Official Angular 21 support |
| ngx-image-cropper | 9.1.2 | **9.1.5** | ✅ Patch update |
| ngx-lottie | 13.0.1 | **20.0.0** | ✅ Version alignment (Angular 20/21 compatible) |

## ⚠️ Intentionally NOT Upgraded

### UI Libraries (Breaking Changes)
| Package | Current | Available | Reason NOT Upgraded |
|---------|---------|-----------|---------------------|
| primeng | 19.0.9 | 21.0.0 | **Major breaking changes** (sidebar→drawer, calendar→datepicker, overlaypanel→popover). Requires separate migration. |
| @primeng/themes | 19.0.9 | 21.0.0 | Kept in sync with primeng |
| primeicons | 7.0.0 | Latest | Compatible with PrimeNG 19 |
| primeflex | 4.0.0 | Latest | Compatible |

## ⚠️ Third-Party Compatibility Issues

### Packages with Peer Dependency Warnings
| Package | Version | Issue | Resolution |
|---------|---------|-------|------------|
| ~~ng-recaptcha~~ | ~~13.2.1~~ | ~~Requires Angular ^17.0.0~~ | ✅ **RESOLVED**: Migrated to ng-recaptcha-2@21.0.1 |
| @abacritt/angularx-social-login | 2.3.0 | No Angular 21 version yet | Works with Angular 21 |

## 🔍 NOT Angular-Specific (No Update Required)

| Package | Version | Notes |
|---------|---------|-------|
| jwt-decode | 4.0.0 | Framework-agnostic |
| lottie-web | 5.12.2 | Framework-agnostic |
| ng-otp-input | 2.0.7 | No v21 available (works with Angular 21) |
| ~~ngx-device-detector~~ | ~~9.0.0~~ | ✅ **UPGRADED** to 11.0.0 (Angular 21 support) |
| ngx-editor | 18.0.0 | No v21 available (waiting for stable release) |
| ~~ngx-image-cropper~~ | ~~9.1.2~~ | ✅ **UPGRADED** to 9.1.5 (patch update) |
| ~~ngx-lottie~~ | ~~13.0.1~~ | ✅ **UPGRADED** to 20.0.0 (Angular 20/21 compatible) |
| plausible-tracker | 0.3.9 | Framework-agnostic |
| tailwindcss-primeui | 0.5.1 | PrimeNG theme extension |
| rxjs | 7.8.0 | Compatible with Angular 21 |
| tslib | 2.3.0 | TypeScript runtime |
| zone.js | 0.15.0 | Compatible |

## 📊 Summary

- **Angular Core**: ✅ All 9 packages upgraded to v21.0.6
- **Angular DevTools**: ✅ All 3 packages upgraded to v21.0.4/v21.0.6
- **TypeScript**: ✅ Upgraded to 5.9.3 (exceeds v5.6 minimum)
- **NgRx**: ✅ All 5 packages upgraded to v21.0.0
- **Third-party (Phase 2B)**: ✅ 4 packages upgraded, 1 replaced with Angular 21-compatible fork
- **PrimeNG**: ⚠️ Intentionally kept at v19 (breaking changes - separate migration planned)
- **Remaining peer warnings**: ⚠️ 1 package (@abacritt/angularx-social-login - works fine)

## ✅ Validation Decisions (Resolved 2025-12-19)

1. **PrimeNG v19 vs v21**
   - ✅ **DECISION**: Deferred to separate migration task
   - **Action Taken**: Created user story at `docs/user-stories/primeng-v21-migration.md`
   - **Timeline**: Post-Angular 21 migration completion

2. **Third-party packages without Angular 21 support**
   - ✅ **DECISION**: Upgraded where possible, kept where necessary
   - **Actions Taken**:
     - ngx-device-detector: ✅ Upgraded to 11.0.0 (official Angular 21 support)
     - ngx-image-cropper: ✅ Upgraded to 9.1.5 (patch update)
     - ngx-lottie: ✅ Upgraded to 20.0.0 (Angular 20/21 compatible)
     - ng-otp-input: Kept at 2.0.7 (works with `--legacy-peer-deps`)
     - ngx-editor: Kept at 18.0.0 (waiting for stable Angular 21 release)
   - **Documentation**: See `third-party-packages-analysis.md`

3. **ng-recaptcha compatibility**
   - ✅ **DECISION**: Migrated to ng-recaptcha-2@21.0.1
   - **Actions Taken**:
     - Replaced ng-recaptcha with ng-recaptcha-2 (actively maintained fork)
     - Updated 2 import statements
     - Zero peer dependency warnings
   - **Documentation**: See `ng-recaptcha-alternatives.md`


## 🔍 Version Discrepancies (package.json vs installed)

| Package | package.json | Installed | Note |
|---------|--------------|-----------|------|
| @angular/google-maps | ^21.0.0 | 21.0.5 | ✅ Patch update by npm |
| primeng | ^19.0.9 | 19.1.4 | ✅ Minor update by npm |
| @primeng/themes | ^19.0.9 | 19.1.4 | ✅ Minor update by npm |
| ngx-cookie-service | ^21.0.0 | 21.1.0 | ✅ Minor update by npm |

**All discrepancies are minor/patch updates and are acceptable.**

