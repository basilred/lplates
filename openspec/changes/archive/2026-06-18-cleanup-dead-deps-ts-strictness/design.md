## Context

The codebase has accumulated technical debt: unused dependencies from experimental ML work (~3+ MB `@tensorflow/tfjs`), legacy PropTypes (unnecessary with React 19 + TypeScript), `any` types that bypass the compiler, a `@ts-ignore` suppression, and several outdated JS patterns. This is a pure refactoring — no user-facing changes.

All work is confined to the `src/` tree and `package.json`. No architectural changes, no new libraries, no API modifications.

## Goals / Non-Goals

**Goals:**
- Remove `@tensorflow/tfjs` and `prop-types` from `package.json`
- Eliminate all 10 `any` occurrences (type annotations + casts) across 6 files
- Resolve `@ts-ignore` in `useCamera.ts`
- Rename the `any` field in `IParsedCodes` to `generic`
- Replace `.hasOwnProperty()` with `Object.hasOwn()`
- Remove unnecessary `useCallback` wrappers
- Optionally: enable `noUncheckedIndexedAccess` and fix resulting errors

**Non-Goals:**
- No architectural changes or component refactors
- No addition of new dependencies
- No behavioral changes to UI or user-facing logic
- No migration of the OpenCV setup (still loaded via global script)

## Decisions

| Decision | Rationale | Alternatives |
|---|---|---|
| **Remove deps outright** | Both `@tensorflow/tfjs` and `prop-types` have zero imports in `src/`. Safe removal. | Keeping them adds dead weight and confusion |
| **Rename field `any` → `generic`** | The field means "non-specific/any-country codes". `generic` is descriptive and avoids keyword collision. | `unspecified`, `anyCountry` |
| **`Object.hasOwn()` over `.hasOwnProperty()`** | ES2022+ — cleaner, safer (works with `Object.create(null)`), target is already `ESNext`. | `.call()` pattern is verbose; `in` operator doesn't distinguish own vs inherited |
| **Remove `countryFlagGetter` useCallback** | `getCountryFlag` is a pure module-level function — wrapper adds zero value | Keeping it adds noise |
| **Remove `handleFirstAction` useCallback** | Depends on `firstActionDone` which changes once — memoisation is pointless | Keeping it adds noise |
| **Treat `@ts-ignore` as `@ts-expect-error`** | TypeScript 5.5+ recommends `@ts-expect-error` over `@ts-ignore`. Cast via custom constraint type `MediaTrackConstraintExtended` | Removing it outright would break the build |
| **`noUncheckedIndexedAccess` — OPTIONAL** | Valuable strictness but creates ~7–10 new errors. Worth doing but separable. | Leave as follow-up |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **Removing `@tensorflow/tfjs` breaks something if it's loaded via side-effect** | Grep confirms zero imports. `node_modules` clean install will verify. |
| **`noUncheckedIndexedAccess` causes cascading type errors** | Only if enabled — it's optional. If added, each error is a simple `!` assertion or guard. |
| **Renaming `any` field breaks external consumers** | The interface is internal — no public API. TypeScript ensures all usages are updated. |
