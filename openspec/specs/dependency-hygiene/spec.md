## ADDED Requirements

### Requirement: Dependencies SHALL be actively used in source code
Every dependency in `dependencies` (not `devDependencies`) in `package.json` SHALL have at least one import or require in `src/`. Unused runtime dependencies SHALL be removed.

#### Scenario: @tensorflow/tfjs is unused
- **WHEN** `src/` is searched for any import matching `@tensorflow/tfjs` or `@tensorflow`
- **THEN** no imports SHALL be found
- **AND** the dependency SHALL be removed from `package.json`

#### Scenario: prop-types is unused
- **WHEN** `src/` is searched for any import matching `prop-types` or `PropTypes`
- **THEN** no imports SHALL be found
- **AND** the dependency SHALL be removed from `package.json`

### Requirement: Bundle size SHALL be verifiably smaller
After removing unused dependencies, the production bundle size SHALL be measurably reduced.

#### Scenario: bundle size is reduced
- **WHEN** `npm run build` succeeds
- **THEN** the resulting bundle SHALL be smaller than before the change (at minimum by the size of `@tensorflow/tfjs`)
