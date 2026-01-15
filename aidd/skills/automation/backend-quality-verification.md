---
name: skill:verifying-backend-quality
description: Runs automated quality checks for backend completion including duplication, types, and build. Use after completing backend features.
model: claude-opus-4-5
---

# Backend Quality Verification

## Instructions

- Check for code duplication using grep/file analysis in `donaction-api/`
- Verify code reuse patterns are followed (no duplicate logic across files)
- Run `npm run gen:types` in `donaction-api/` to generate TypeScript types
- Verify TypeScript compilation passes with no errors
- Run `npm run build` to ensure Strapi application builds successfully
- Report findings with pass/fail status for each check
- Feature is ONLY complete when ALL checks pass

## Example

- Input: "Verify backend quality after adding email service"
- Output: Quality verification report with pass/fail for each step

**Verification Steps:**

1. ✅ **Duplication Check**: No duplicate code found
2. ✅ **Reuse Validation**: Email helper properly extracted to `helpers/emails/`
3. ✅ **Type Generation**: `npm run gen:types` completed successfully
4. ✅ **TypeScript Check**: No type errors detected
5. ✅ **Build Verification**: `npm run build` completed successfully

**Result**: ✅ All quality checks passed - Feature is complete

---

**Failed Example:**

1. ✅ **Duplication Check**: No duplicate code found
2. ❌ **Reuse Validation**: Duplicate email sending logic in 2 controllers
3. ⏭️ **Type Generation**: Skipped (fix reuse issues first)
4. ⏭️ **TypeScript Check**: Skipped
5. ⏭️ **Build Verification**: Skipped

**Result**: ❌ Quality checks FAILED - Feature is NOT complete

**Required Actions**:
- Extract duplicate email logic to shared helper function
- Re-run verification after fixes

```bash
# Commands executed in donaction-api/
cd donaction-api

# Step 1: Generate types
npm run gen:types

# Step 2: TypeScript check (implicit in build)
# No dedicated command - checked during build

# Step 3: Build
npm run build
```
