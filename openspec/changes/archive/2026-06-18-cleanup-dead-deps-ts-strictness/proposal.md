## Why

Remove dead weight (~3+ MB of unused dependencies) and close TypeScript safety holes across the codebase. Multiple `any` types, a `@ts-ignore` suppression, legacy patterns (`hasOwnProperty`), a misleading field name (`any`), and unnecessary `useCallback` wrappers reduce code quality and type safety incrementally. Cleaning these up lowers maintenance burden, shrinks bundle size, and makes the codebase more approachable.

## What Changes

- **Remove** `@tensorflow/tfjs` (unused, ~3+ MB) and `prop-types` (unused, TypeScript renders it obsolete) from `package.json`
- **Replace** all `any` type annotations and `as any` casts with proper TypeScript types (10 occurrences across 6 files)
- **Fix** `@ts-ignore` in `src/hooks/useCamera.ts` — either remove or replace with proper type handling
- **Rename** field `any` in `IParsedCodes` interface (`src/utils/plateParser.ts`) to a descriptive name
- **Modernise** `hasOwnProperty` calls → `Object.hasOwn()` (ES2022+) in `src/hooks/useRegionData.ts`
- **Remove** unnecessary `useCallback` wrappers in `src/App/App.tsx`
- **Optionally** enable `noUncheckedIndexedAccess` in `tsconfig.json` and fix resulting type errors (7–10 locations)

## Capabilities

### New Capabilities
- `type-safety`: Stronger TypeScript strictness — eliminated `any` leakage, proper DOM event types, removal of type suppressions
- `dependency-hygiene`: Clean dependency tree — unused packages removed, bundle size reduced

### Modified Capabilities

*(none — this is entirely internal quality work with no spec-level behavior changes)*

## Impact

- **Dependencies**: `@tensorflow/tfjs` and `prop-types` removed; `package.json` and `package-lock.json` updated
- **Type system**: 6 files gain proper types; `noUncheckedIndexedAccess` optionally enabled
- **Bundle size**: ~3+ MB reduction from `@tensorflow/tfjs` removal
- **Build**: Must pass `npm run typecheck` and `npm run build` without new errors
- **Tests**: All existing tests must continue passing
