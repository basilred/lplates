## 1. Setup

- [x] 1.1 Create feature branch from `master`
- [x] 1.2 Audit current state — run `npm run typecheck` and `npm run build` to establish baseline

## 2. Remove dead dependencies

- [x] 2.1 Remove `@tensorflow/tfjs` from `package.json` (`prop-types` retained — peer dep of `react-simple-maps`, required at runtime)
- [x] 2.2 Run `npm install` to clean `node_modules` and update `package-lock.json`
- [x] 2.3 Verify `npm run build` succeeds and bundle size is reduced

## 3. Fix `any` types — `src/utils/cvUtils.ts`

- [x] 3.1 Replace `declare const cv: any` with full typed `OpenCV` interface in `cvUtils.ts`
- [x] 3.2 Type `extractPlate(src: any, approx: any)` → `extractPlate(src: CVMat, approx: CVMat)`

## 4. Fix `any` types — `src/components/RegionMap/RegionMap.tsx`

- [x] 4.1 Type `geoData` → `Topology | null`, `projection` → `ProjectionFunction | null`
- [x] 4.2 Replace `as any` casts with proper type assertions through `unknown`
- [x] 4.3 Type `f` parameter as `Feature` with optional property access

## 5. Fix `any` types — `src/contexts/LanguageContext.tsx`

- [x] 5.1 Type `value` and `fallbackValue` as `Record<string, unknown> | string`

## 6. Fix `any` types — `src/components/CameraScanner/CameraScanner.tsx`

- [x] 6.1 Type `e` parameter as `Event` with cast to `CustomEvent<{ plate?: string }>` inside

## 7. Fix `@ts-ignore` — `src/hooks/useCamera.ts`

- [x] 7.1 Create `ExtendedVideoTrackConstraints` type and use `as` cast instead of `@ts-ignore`

## 8. Rename field `any` — `src/utils/plateParser.ts`

- [x] 8.1 Rename field `any` → `generic` in `IParsedCodes` interface
- [x] 8.2 Update all usages: assignment in `plateParser.ts`, comparison in `LookupPanel.tsx`, test file

## 9. Modernise `hasOwnProperty` — `src/hooks/useRegionData.ts`

- [x] 9.1 Replace `data.hasOwnProperty(country)` with `Object.hasOwn(data, country)` (line 17)
- [x] 9.2 Replace `currentCountry.hasOwnProperty(regionId)` with `Object.hasOwn(currentCountry, regionId)` (line 21)

## 10. Remove unnecessary `useCallback` — `src/App/App.tsx`

- [x] 10.1 Remove `useCallback` wrapper from `countryFlagGetter` — pass `getCountryFlag` directly
- [x] 10.2 Remove `useCallback` wrapper from `handleFirstAction` — use plain function

## 11. Optional: `noUncheckedIndexedAccess`

- [ ] 11.1 Enable `noUncheckedIndexedAccess` in `tsconfig.json` (deferred — 65+ type errors, separate change)
- [ ] 11.2 Fix all resulting type errors (guards or `!` assertions where safe)

## 12. Verification

- [x] 12.1 Run `npm run typecheck` — confirm zero errors
- [x] 12.2 Run `npm run build` — confirm build succeeds
- [x] 12.3 Run lint — confirm no regressions
- [x] 12.4 Run tests — confirm all pass
