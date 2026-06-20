## 1. Setup

- [x] 1.1 Create feature branch from `master`
- [x] 1.2 Run `npm run typecheck` to establish baseline (zero errors)
- [x] 1.3 Enable `noUncheckedIndexedAccess: true` in `tsconfig.json`
- [x] 1.4 Run `npx tsc --noEmit` to count and locate all new errors

## 2. LanguageSwitcher — direct lookup

- [x] 2.1 Replace `LANGUAGES.find(lang => lang.code === locale)` with `LANGUAGE_CONFIG[locale]` 
- [x] 2.2 Remove `|| LANGUAGES[0]` fallback (direct lookup on `Record<Locale, LanguageInfo>` never returns undefined)

## 3. plateParser — regex match groups

- [x] 3.1 Add `!` to `match[1]` at line 46 (`results.ru = [match[1]!]`)
- [x] 3.2 Add `!` to `match[1]` at lines 54, 60, 66 (same pattern, after `if (match)` guard)

## 4. useRegionData — indexed region access

- [x] 4.1 Add non-null assertion to `regionData` at line 22 (for...in guarantees existence)

## 5. mapUtils.test — test assertions

- [x] 5.1 Extract `MAP_CONFIG[country]` into `const config` with `!` assertion

## 6. useOCR — consensus logic guards

- [x] 6.1 Fix `fullPlates[0]` and `counts` sort access — non-null assertions
- [x] 6.2 Fix `candidates[0]` and sort access — non-null assertions
- [x] 6.3 Fix `bestInfo` access — non-null assertion (guaranteed key)
- [x] 6.4 Refactor counts loop to use local variable instead of repeated computed key access

## 7. cvUtils — OpenCV array accesses

- [x] 7.1 Add `!` to `approx.data32S[j * 2]` and `approx.data32S[j * 2 + 1]` at lines 106–107
- [x] 7.2 Add `!` to `approx.data32S[i * 2]` and `approx.data32S[i * 2 + 1]` at line 138 (cascade-fixes points type)
- [x] 7.3 Add `!` to `charBoxes[0]` at line 192 (guarded by `charBoxes.length > 0`)
- [x] 7.4 Add `!` to `next = charBoxes[i]` at line 194 (loop within length guard)
- [x] 7.5 Add `!` to `current` and `next` cascade (fixes all merge loop property accesses)
- [x] 7.6 Add `!` to `top[0]`, `top[1]`, `bottom[0]`, `bottom[1]` at line 155

## 8. Verification

- [x] 8.1 Run `npm run typecheck` — confirm zero errors
- [x] 8.2 Run `npm run build` — confirm build succeeds
- [x] 8.3 Run tests — confirm all pass (19/19)
- [ ] 8.4 Commit changes to feature branch
