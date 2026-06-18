## ADDED Requirements

### Requirement: Codebase SHALL NOT use `any` types in production code
All type annotations and type casts using `any` in `src/` (excluding type declaration files) SHALL be replaced with proper TypeScript types — concrete interfaces, union types, or constrained generics. This applies to variable annotations, parameter types, return types, and `as any` casts.

#### Scenario: `any` type annotations are removed
- **WHEN** the codebase is scanned for `: any` type annotations (excluding `.d.ts` files and `node_modules`)
- **THEN** no occurrences SHALL remain

#### Scenario: `as any` casts are removed
- **WHEN** the codebase is scanned for `as any` casts
- **THEN** no occurrences SHALL remain

#### Scenario: `useState<any>` is removed
- **WHEN** the codebase is scanned for `useState<any>(`
- **THEN** no occurrences SHALL remain

### Requirement: TypeScript strict options SHALL be maximised
The project SHALL enable `noUncheckedIndexedAccess` in `tsconfig.json` and fix all resulting type errors. If this is deferred (optional), the proposal SHALL explicitly document the decision.

#### Scenario: noUncheckedIndexedAccess is enabled
- **WHEN** `tsconfig.json` has `noUncheckedIndexedAccess: true`
- **THEN** `npm run typecheck` SHALL pass with zero errors

### Requirement: `@ts-ignore` SHALL NOT be used
All `@ts-ignore` comments SHALL be replaced with `@ts-expect-error` or removed in favour of properly typed code.

#### Scenario: @ts-ignore is removed
- **WHEN** the codebase is scanned for `@ts-ignore`
- **THEN** no occurrences SHALL remain

### Requirement: Field names SHALL NOT collide with TypeScript reserved words
Interface and type field names that collide with TypeScript keywords or built-in types SHALL be renamed to descriptive alternatives.

#### Scenario: `any` field is renamed
- **WHEN** `IParsedCodes` interface in `src/utils/plateParser.ts` is inspected
- **THEN** the field formerly named `any` SHALL have a descriptive name (e.g., `generic`, `unspecified`, `anyCountry`)

### Requirement: `Object.hasOwn()` SHALL be used over `.hasOwnProperty()`
All calls to `.hasOwnProperty()` SHALL be replaced with `Object.hasOwn()` (ES2022+).

#### Scenario: hasOwnProperty calls are replaced
- **WHEN** the codebase is scanned for `.hasOwnProperty(`
- **THEN** no occurrences SHALL remain
- **AND** all replacements use `Object.hasOwn()`

### Requirement: Unnecessary `useCallback` wrappers SHALL be removed
`useCallback` wrappers that provide no memoisation benefit (no dependencies, or dependencies that change at most once) SHALL be removed. The wrapped function SHALL be inlined or passed directly.

#### Scenario: unnecessary useCallback is removed
- **WHEN** `src/App/App.tsx` is inspected for `useCallback` usage
- **THEN** `countryFlagGetter` and `handleFirstAction` SHALL NOT use `useCallback`
