## Context

The previous `cleanup-dead-deps-ts-strictness` change eliminated `any` types, removed dead deps, and modernised patterns — but deferred `noUncheckedIndexedAccess` due to the volume of errors (~65 at the time, ~53 now after some were fixed incidentally).

Current state: `strict: true` in tsconfig, but indexed access (`arr[i]`, `obj[key]`) silently returns `T` instead of `T | undefined`. Six files need updates before the flag can be enabled without build errors.

## Goals / Non-Goals

**Goals:**
- Enable `noUncheckedIndexedAccess: true` in `tsconfig.json`
- Fix all ~53 type errors across 6 files
- Follow a consistent per-location strategy: `!` where the value is provably present, proper guards where real risk exists

**Non-Goals:**
- No behavioral changes to UI or logic
- No architectural refactors
- No new dependencies
- No changes outside the 6 affected files + tsconfig.json

## Decisions

| Decision | Rationale | Alternatives |
|---|---|---|
| **Hybrid strategy: `!` for provable invariants, guards for real risk** | Reduces noise without sacrificing safety. `!` where logic guarantees presence (regex match after check, array access after length guard, OpenCV buffer access with computed index). Guards where access is genuinely uncertain (computed key lookup, `.find()` result). | All `!` is lazy and masks real bugs. All guards adds 50+ lines of dead branches. |
| **`plateParser.ts` — `match[1]!`** | Each regex is checked with `if (match)`. When a pattern matches, all capture groups are present. Safe to assert. | Adding `|| ''` default is equivalent but more verbose. |
| **`useRegionData.ts` — `regionData!`** | `for...in` over `currentCountry` guarantees each `regionId` key exists in the object. No guard needed. | Adding an `if (!regionData) continue` block is defensive but unreachable — wastes readers' attention. |
| **`LanguageSwitcher.tsx` — replace `find` with direct lookup** | `LANGUAGE_CONFIG` is a `Record<Locale, LanguageInfo>` with all 7 locales present. Direct lookup instead of `find()` eliminates the `undefined` entirely. `LANGUAGES[0]` fallback also becomes `undefined` under the flag — replace with a default object. | `find()!` with `|| LANGUAGES[0]!` works but is misleading — implies uncertainty where none exists. |
| **`useOCR.ts` — guards for `candidates[0]` and `bestInfo`** | `candidates` is built from `Object.keys(counts)` — could theoretically be empty if `resultsBufferRef.current` only has undefined entries. The guard makes the real code path clearer. | `!` assertion is technically safe (buffer always has entries when this runs) but the risk/reward of a guard is worth it for readability. |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **`!` assertion hides a real bug** | Each `!` is paired with a comment or adjacent guard that makes the invariant obvious. Code review verifies each one. |
| **`cvUtils.ts` OpenCV buffer access (`data32S[i]`) goes out of bounds** | OpenCV guarantees the buffer size matches the matrix dimensions. The `i` values are derived from `approx.rows` (always 4 for quad contours) and `j * 2` arithmetic. Safe. |
| **Regression in `useOCR.ts` stability logic** | Covered by existing tests. The guard path is a no-op fallback that preserves current behavior (empty string). |
