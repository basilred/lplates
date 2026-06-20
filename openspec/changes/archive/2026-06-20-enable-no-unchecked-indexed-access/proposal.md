## Why

TypeScript's `noUncheckedIndexedAccess` catches potential runtime errors from accessing array/object indices that may not exist. Without it, every `arr[i]` and `obj[key]` is assumed to always return a value — a false promise that hides real bugs. Enabling this flag strengthens the type system and surfaces ~53 currently invisible failure points across the codebase.

Deferred from the previous `cleanup-dead-deps-ts-strictness` change — the original scope only covered low-hanging fruit (`any` types, `@ts-ignore`, dead deps). The 53+ type errors from this flag needed their own focused change.

## What Changes

- Enable `noUncheckedIndexedAccess: true` in `tsconfig.json`
- Fix all ~53 resulting type errors across 6 files using a per-location strategy (non-null assertions where invariants are provable, proper guards where real risk exists)

## Capabilities

### New Capabilities

*(none — purely internal TypeScript strictness, no user-facing behavior changes)*

### Modified Capabilities

*(none — no spec-level requirement changes)*

## Impact

- **Build**: Single `tsconfig.json` change + fixes in 6 source files
- **Type system**: Every indexed access (`arr[i]`, `obj[key]`) now requires explicit `undefined` handling
- **Runtime safety**: Catches potential crashes from `undefined` reads without optional chaining
- **Tests**: All existing tests must continue passing; `npm run typecheck` must pass
