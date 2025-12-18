# ng-recaptcha Angular 21 Alternatives Analysis

**Generated**: 2025-12-19
**Current Package**: `ng-recaptcha@13.2.1`
**Issue**: Requires Angular ^17.0.0, installed with `--legacy-peer-deps`

---

## Executive Summary

| Option | Angular 21 Support | API Compatibility | Migration Effort | Recommendation |
|--------|-------------------|-------------------|------------------|----------------|
| **ng-recaptcha-2** | ✅ v21.0.1 | ✅ Drop-in replacement | ⭐ Low | **RECOMMENDED** |
| ngx-captcha-kit | ✅ Requires Angular 20+ | ⚠️ Different API | Medium | Alternative |
| ngx-captcha | ❌ v14.0.0 only | ⚠️ Different API | Medium | Not recommended |
| Keep current | ⚠️ Works with `--legacy-peer-deps` | ✅ No change | None | Temporary only |

---

## Option 1: ng-recaptcha-2 ⭐ RECOMMENDED

### Overview
Active fork of `ng-recaptcha` with Angular 21 support. Follows Angular's version numbering scheme for clear compatibility.

### Package Details
- **npm**: [ng-recaptcha-2](https://www.npmjs.com/package/ng-recaptcha-2)
- **GitHub**: [LakhveerChahal/ng-recaptcha-2](https://github.com/LakhveerChahal/ng-recaptcha-2)
- **Latest Version**: `21.0.1`
- **Published**: 25 days ago (actively maintained)
- **Parent Project**: ng-recaptcha (official fork)

### Version Compatibility
- **v21.x.x** → Angular 21.x.x ✅
- **v20.x.x** → Angular 20.x.x
- **v19.x.x** → Angular 19.x.x

### Features
- ✅ Google reCAPTCHA v2 (checkbox & invisible)
- ✅ Google reCAPTCHA v3 (score-based)
- ✅ Same API as `ng-recaptcha`
- ✅ RecaptchaLoaderService for custom loading
- ✅ Standalone component support
- ✅ Reactive Forms integration

### Migration Path

#### 1. Installation
```bash
npm uninstall ng-recaptcha
npm install ng-recaptcha-2@21.0.1
```

#### 2. Update Imports
```typescript
// Before (ng-recaptcha)
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha';

// After (ng-recaptcha-2) - Same imports!
import { RecaptchaModule } from 'ng-recaptcha-2';
import { RecaptchaFormsModule } from 'ng-recaptcha-2';
```

#### 3. Component Usage
**No changes needed** - Same API:
```typescript
<re-captcha
  (resolved)="onCaptchaResolved($event)"
  [siteKey]="siteKey"
></re-captcha>
```

#### 4. Configuration
```typescript
// app.config.ts (if using custom loader options)
import { RECAPTCHA_LOADER_OPTIONS } from 'ng-recaptcha-2';

providers: [
  {
    provide: RECAPTCHA_LOADER_OPTIONS,
    useValue: {
      onBeforeLoad(url) {
        return { url: url + '&enterprise=true' };
      }
    }
  }
]
```

### Breaking Changes from ng-recaptcha
**None** - API-compatible fork

### Pros
- ✅ **Drop-in replacement** - minimal code changes
- ✅ **Official Angular 21 support** with version alignment
- ✅ **Actively maintained** (published 25 days ago)
- ✅ **Same API** as original ng-recaptcha
- ✅ **Low migration risk**
- ✅ **Clear versioning strategy** (follows Angular versions)

### Cons
- ⚠️ Fork of original project (not official Google library)
- ⚠️ Smaller community than original ng-recaptcha
- ⚠️ Dependency on fork maintainer for future updates

### Migration Checklist
- [ ] Install `ng-recaptcha-2@21.0.1`
- [ ] Uninstall `ng-recaptcha`
- [ ] Update imports from `ng-recaptcha` → `ng-recaptcha-2`
- [ ] Test reCAPTCHA rendering
- [ ] Test form submission with token
- [ ] Verify v2 checkbox behavior
- [ ] Verify v3 score-based behavior (if used)
- [ ] Test in all environments
- [ ] Remove `--legacy-peer-deps` from package.json scripts
- [ ] Production build succeeds
- [ ] No peer dependency warnings

### Recommendation
**STRONGLY RECOMMENDED** for immediate adoption
- **Risk**: Low
- **Effort**: 1-2 hours
- **Impact**: High (removes peer dependency warnings)

---

## Option 2: ngx-captcha-kit

### Overview
Modern Angular library supporting multiple CAPTCHA providers with unified API. Built for Angular 20+ with Signals and zoneless support.

### Package Details
- **npm**: Not yet published (GitHub only)
- **GitHub**: [edward124689/ngx-captcha-kit](https://github.com/edward124689/ngx-captcha-kit)
- **Latest Version**: Development
- **Requirements**: Angular 20+ (should work with Angular 21)

### Features
- ✅ **Multiple CAPTCHA Providers**:
  - Google reCAPTCHA v2 (checkbox & invisible)
  - Google reCAPTCHA v3 (score-based)
  - Cloudflare Turnstile
  - Alibaba Cloud Captcha 2.0
- ✅ Unified `<captcha-kit>` component
- ✅ Modern Angular support (Signals, zoneless)
- ✅ Dynamic script loading with SSR compatibility
- ✅ Language customization
- ✅ Standalone component architecture

### Migration Path

#### 1. Installation
```bash
# Not yet on npm - would need to install from GitHub
npm install github:edward124689/ngx-captcha-kit
```

#### 2. Component Usage
```typescript
// Unified API for all CAPTCHA types
<captcha-kit
  [provider]="'google-v2'"
  [siteKey]="siteKey"
  [language]="'en'"
  (verified)="onVerified($event)"
></captcha-kit>
```

#### 3. Provider Configuration
```typescript
// Switch providers easily
<captcha-kit
  [provider]="'google-v3'"
  [siteKey]="v3SiteKey"
  [action]="'submit'"
  (verified)="onVerified($event)"
></captcha-kit>
```

### Breaking Changes from ng-recaptcha
**Major API change** - completely different component structure

### Pros
- ✅ **Modern Angular architecture** (Signals, zoneless)
- ✅ **Multiple CAPTCHA providers** (future-proof)
- ✅ **Unified API** across providers
- ✅ **SSR compatible**
- ✅ **Standalone components**
- ✅ **Language support**

### Cons
- ❌ **Not yet published to npm** (GitHub only)
- ❌ **Major API change** required
- ❌ **Unknown stability** (development package)
- ❌ **Unproven in production**
- ❌ **Higher migration effort**
- ⚠️ **No versioning/release strategy visible**

### Recommendation
**NOT RECOMMENDED** for immediate migration
- **Risk**: High (unreleased package)
- **Effort**: 4-6 hours (API rewrite)
- **Impact**: Medium (only if multi-provider support needed)

**Consider for future**: If you need Cloudflare Turnstile or other CAPTCHA alternatives

---

## Option 3: ngx-captcha

### Overview
Alternative reCAPTCHA library for Angular, last updated for Angular 14.

### Package Details
- **npm**: [ngx-captcha](https://www.npmjs.com/package/ngx-captcha)
- **GitHub**: [Enngage/ngx-captcha](https://github.com/Enngage/ngx-captcha)
- **Latest Version**: `14.0.0`
- **Published**: 4 months ago
- **Supported**: Angular 14

### Angular Compatibility
- ❌ **No Angular 21 support**
- ❌ Last updated for Angular 14
- ❌ Would require `--legacy-peer-deps`

### Recommendation
**NOT RECOMMENDED**
- **Risk**: High (outdated)
- **Effort**: High (API change + no support)
- **Impact**: Negative (same peer dependency issue)

---

## Option 4: Keep Current ng-recaptcha@13.2.1

### Current Status
- **Version**: `13.2.1`
- **Installation**: Requires `--legacy-peer-deps`
- **Angular Support**: ^17.0.0
- **Status**: Works but shows peer dependency warnings

### Pros
- ✅ **No migration effort**
- ✅ **Known to work** in current setup
- ✅ **Familiar codebase**

### Cons
- ❌ **Peer dependency warnings**
- ❌ **Not officially supported** for Angular 21
- ❌ **No future updates** (last published 2 years ago)
- ❌ **Technical debt**
- ⚠️ May break in future Angular versions

### Recommendation
**TEMPORARY ONLY**
- Acceptable for short-term if migration is delayed
- Should be replaced with ng-recaptcha-2 in next sprint

---

## Decision Matrix

### Immediate Needs
If you need to resolve the peer dependency warning **NOW**:
- ✅ **Use ng-recaptcha-2** (Option 1)

### Future Needs
If you plan to support multiple CAPTCHA providers:
- 🔮 **Monitor ngx-captcha-kit** (Option 2)
- Wait for stable npm release
- Evaluate in 6 months

### Risk Tolerance
If you want zero risk:
- ⏸️ **Keep current** (Option 4) temporarily
- Plan migration to ng-recaptcha-2 in Q1 2025

---

## Recommended Action Plan

### Phase 1: Immediate Migration (Recommended)
**Timeline**: 1-2 hours

1. **Test ng-recaptcha-2 in development**
   ```bash
   npm install ng-recaptcha-2@21.0.1
   ```

2. **Update imports**
   - Global search/replace: `'ng-recaptcha'` → `'ng-recaptcha-2'`

3. **Test functionality**
   - reCAPTCHA v2 rendering
   - Token generation
   - Form submission
   - Error handling

4. **Validate**
   - Production build
   - No console errors
   - No peer dependency warnings

5. **Deploy**
   - Commit changes
   - Deploy to staging
   - Test in production environment

### Phase 2: Documentation (1 hour)
1. Update package.json
2. Update README with new package
3. Document migration in CHANGELOG
4. Update environment configs if needed

### Phase 3: Monitoring (Ongoing)
1. Watch for ng-recaptcha-2 updates
2. Monitor GitHub issues
3. Consider ngx-captcha-kit when it reaches stable release

---

## Testing Checklist

After migration, verify:

### Functionality
- [ ] reCAPTCHA widget renders correctly
- [ ] Checkbox interaction works (v2)
- [ ] Invisible reCAPTCHA triggers (if used)
- [ ] Score-based verification works (v3, if used)
- [ ] Token is generated on success
- [ ] Token is passed to form submission
- [ ] Error handling works
- [ ] Reset functionality works

### Build & Environment
- [ ] Development build succeeds
- [ ] Production build succeeds
- [ ] No TypeScript errors
- [ ] No peer dependency warnings
- [ ] Bundle size acceptable
- [ ] SSR works (if applicable)

### Integration
- [ ] Forms submit with valid token
- [ ] Backend validation accepts token
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Retry logic works

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## Migration Script

```bash
#!/bin/bash
# ng-recaptcha to ng-recaptcha-2 migration

echo "🔄 Migrating from ng-recaptcha to ng-recaptcha-2..."

# 1. Uninstall old package
echo "📦 Uninstalling ng-recaptcha..."
npm uninstall ng-recaptcha

# 2. Install new package
echo "📦 Installing ng-recaptcha-2@21.0.1..."
npm install ng-recaptcha-2@21.0.1

# 3. Update imports (macOS/Linux)
echo "🔧 Updating imports..."
find src -type f \( -name "*.ts" -o -name "*.html" \) -exec sed -i '' "s/'ng-recaptcha'/'ng-recaptcha-2'/g" {} +

# 4. Build
echo "🏗️ Building project..."
npm run build

echo "✅ Migration complete! Please test thoroughly."
```

---

## Comparison Table

| Feature | ng-recaptcha | ng-recaptcha-2 | ngx-captcha-kit | ngx-captcha |
|---------|--------------|----------------|-----------------|-------------|
| **Angular 21 Support** | ❌ | ✅ | ✅ | ❌ |
| **Last Updated** | 2 years ago | 25 days ago | Development | 4 months ago |
| **API Compatibility** | Original | Same | Different | Different |
| **reCAPTCHA v2** | ✅ | ✅ | ✅ | ✅ |
| **reCAPTCHA v3** | ✅ | ✅ | ✅ | ✅ |
| **Cloudflare Turnstile** | ❌ | ❌ | ✅ | ❌ |
| **Standalone Components** | ✅ | ✅ | ✅ | ❌ |
| **Signals Support** | ❌ | ⚠️ Unknown | ✅ | ❌ |
| **Migration Effort** | N/A | Low | Medium | Medium |
| **npm Package** | ✅ | ✅ | ❌ | ✅ |
| **Active Maintenance** | ❌ | ✅ | ⚠️ Unknown | ⚠️ Limited |

---

## Final Recommendation

### ✅ RECOMMENDED: Migrate to ng-recaptcha-2

**Reasons**:
1. **Official Angular 21 support** with version alignment
2. **Drop-in replacement** - minimal code changes
3. **Actively maintained** - published 25 days ago
4. **Low risk** - API-compatible fork
5. **Removes peer dependency warnings**
6. **Clear upgrade path** for future Angular versions

**Migration Timeline**: 1-2 hours
**Risk Level**: Low ✅
**Effort Level**: Low ✅

### 🔮 FUTURE CONSIDERATION: ngx-captcha-kit

**When**:
- Package is published to npm
- Stable release (v1.0.0+)
- Need multi-provider support (Cloudflare, Alibaba)
- 6+ months from now

---

## Resources

### ng-recaptcha-2
- [npm Package](https://www.npmjs.com/package/ng-recaptcha-2)
- [GitHub Repository](https://github.com/LakhveerChahal/ng-recaptcha-2)
- [Changelog](https://github.com/LakhveerChahal/ng-recaptcha-2/blob/master/CHANGELOG.md)

### ngx-captcha-kit
- [GitHub Repository](https://github.com/edward124689/ngx-captcha-kit)

### Original ng-recaptcha
- [npm Package](https://www.npmjs.com/package/ng-recaptcha)
- [GitHub Repository](https://github.com/DethAriel/ng-recaptcha)

### Google reCAPTCHA
- [Official Documentation](https://developers.google.com/recaptcha)
- [v2 Documentation](https://developers.google.com/recaptcha/docs/display)
- [v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
