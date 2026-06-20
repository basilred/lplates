## MODIFIED Requirements

### Requirement: TypeScript strict options SHALL be maximised

**Previous state**: Deferred (optional). The requirement was documented in the original spec but marked as optional due to the volume of errors.

**Current state**: Required. `noUncheckedIndexedAccess: true` SHALL be enabled in `tsconfig.json` and all resulting type errors SHALL be fixed.

The project SHALL enable `noUncheckedIndexedAccess` in `tsconfig.json` and fix all resulting type errors across the codebase. Indexed access on arrays and objects with index signatures SHALL handle the `| undefined` case explicitly — either via non-null assertions (`!`) where the value is provably present, or via proper guards (`if` checks, optional chaining) where real uncertainty exists.

#### Scenario: noUncheckedIndexedAccess is enabled
- **WHEN** `tsconfig.json` has `noUncheckedIndexedAccess: true`
- **THEN** `npm run typecheck` SHALL pass with zero errors
