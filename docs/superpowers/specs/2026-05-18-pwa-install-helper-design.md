# PWA Install Helper — Design Spec

**Issue:** [#51](https://github.com/basilred/lplates/issues/51)
**Date:** 2026-05-18
**Branch:** `feat/51-pwa-install-helper`

---

## Overview

Add an interactive PWA installation helper to improve user retention. The feature consists of a custom `usePWAInstall` hook, a glassmorphism UI prompt component (`PWAInstallPrompt`), and a persistent install button in the header. The prompt triggers after the user's first successful action (search or camera scan), not on first load.

---

## Decisions

| Decision | Choice |
|----------|--------|
| Trigger timing | After first successful action (search or scan) |
| Dismiss behavior | Hide forever — flag in `localStorage` (`pwa_install_dismissed`) |
| Settings button placement | In `Header-Actions`, alongside ThemeToggle and LanguageSwitcher |
| Architecture | Hook-centric (no context) — components consume `usePWAInstall` directly |

---

## New Files

### `src/hooks/usePWAInstall.ts`

Reusable hook encapsulating all PWA install logic.

**Interface:**

```ts
interface UsePWAInstallResult {
  isInstalled: boolean;      // true if running in standalone mode
  isInstallable: boolean;    // true if beforeinstallprompt is available
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  isDismissed: boolean;      // true if user previously dismissed
  promptInstall(): void;     // trigger native install dialog (Android) or noop (iOS)
  dismiss(): void;           // set localStorage flag, hide prompt
}
```

**Internal behavior:**
- Listens for `beforeinstallprompt` event, stores `deferredPrompt` in a ref
- Detects platform via user-agent parsing: `/(iPhone|iPad|iPod)/i` for iOS, `/Android/i` for Android, `/Windows|Mac|Linux/` for desktop
- Checks standalone mode via `window.matchMedia('(display-mode: standalone)').matches`
- Reads/writes `localStorage` key `pwa_install_dismissed`
- On `promptInstall()`: calls `deferredPrompt.prompt()` and handles `userChoice`
- On `appinstalled` event: sets `isInstalled: true`
- Returns stable references — no unnecessary re-renders

**State transitions:**

```
isInstalled=true → nothing is shown (already installed)
isInstalled=false + isInstallable=false + isDismissed=false + firstActionDone=false → waiting
isInstalled=false + isInstallable=false + isDismissed=false + firstActionDone=true → show prompt
isInstalled=false + isInstallable=true + isDismissed=false + firstActionDone=true → show prompt
isInstalled=false + isDismissed=true → never show prompt (button in header only)
```

### `src/components/PWAInstallPrompt/PWAInstallPrompt.tsx`

Floating bottom banner component. Internally checks `isDismissed` from `usePWAInstall`. Shows only when both conditions are true: `visible` prop is `true` AND `isDismissed` is `false`.

**Props:**

```ts
interface PWAInstallPromptProps {
  visible: boolean;          // controlled by parent (App.tsx) — true when firstActionDone
  onClose: () => void;       // callback when user dismisses (calls hook's dismiss())
}
```

**Platform-specific rendering:**

- **Android / Desktop:** Title + description + "Install" button (calls `promptInstall()`)
- **iOS:** Title + 2-step visual instruction:
  1. Tap the Share button in Safari (with icon)
  2. Choose "Add to Home Screen" (with icon)
- **Both:** Close button (×) in top-right corner

**Animation:**
- Entry: `opacity 0→1` + `translateY(20px→0)` over 400ms `cubic-bezier(0.4,0,0.2,1)`
- Exit: same in reverse, component removed from DOM via `onTransitionEnd`

**Accessibility:**
- `role="dialog"`, `aria-label` from translations
- Close button has `aria-label`
- Install button has `aria-label`

### `src/components/PWAInstallPrompt/PWAInstallPrompt.css`

BEM methodology, consistent with existing components. Uses only project CSS variables.

**Key classes:**
- `PWAInstallPrompt` — fixed bottom container, `z-index: 200`
- `PWAInstallPrompt_visible` — entry animation state
- `PWAInstallPrompt_hiding` — exit animation state
- `PWAInstallPrompt-Banner` — glass card with `backdrop-filter: blur(20px)`, `border-radius: 16px 16px 0 0`
- `PWAInstallPrompt-Close` — close button, top-right
- `PWAInstallPrompt-Title` — heading text
- `PWAInstallPrompt-Description` — subtitle text
- `PWAInstallPrompt-InstallButton` — install CTA, accent color
- `PWAInstallPrompt-Steps` — iOS step container
- `PWAInstallPrompt-Step` — individual step row with number circle

**Variables used:** `--color-glass-bg`, `--color-glass-border`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-surface`, `--color-border`, `--color-shadow`

---

## Modified Files

### `src/App/App.tsx`

- Add `const [firstActionDone, setFirstActionDone] = useState(false)`
- Set `firstActionDone = true` when:
  - `LookupPanel` completes a successful search (callback prop)
  - `scannedPlate` becomes non-null (camera scan success)
- Render `<PWAInstallPrompt visible={firstActionDone && !isDismissed} onClose={...} />`
- Pass `onFirstAction` callback to `LookupPanel`

### `src/components/Header/Header.tsx`

- Import `usePWAInstall`
- Conditionally render install button in `Header-Actions`:
  - Shown when `isInstallable && !isInstalled`
  - Calls `promptInstall()` on click
  - Icon-only on mobile (⬇️), text+icon on desktop (⬇️ Install)

### `src/components/Header/Header.css`

- Add `Header-InstallButton` class
- Style: transparent background, accent color, `border-radius: 8px`, `padding: 6px 10px`
- Hover: `background: var(--color-surface-hover)`
- Mobile: icon-only via media query

### `src/locales/*.json` (8 files)

New translation keys under `app.install`:

```json
{
  "install": {
    "installApp": "Install App",
    "addToHomeScreen": "Add to Home Screen",
    "title": "Install LPlates",
    "description": "Get quick access without a browser",
    "installButton": "Install",
    "dismiss": "Close",
    "iosStep1": "Tap the Share button in Safari",
    "iosStep2": "Choose «Add to Home Screen»"
  }
}
```

### `e2e/pwa/install-prompt.spec.ts`

New Playwright test file.

**Tests:**
1. Prompt is hidden before any user action
2. Prompt appears after successful search (Android emulation via `beforeinstallprompt` mock)
3. iOS instruction displays correctly when user-agent simulates iOS Safari
4. Close button sets `localStorage.pwa_install_dismissed = "true"` and hides prompt
5. Prompt does not reappear on next visit (dismissed flag persisted)
6. Header install button triggers `deferredPrompt.prompt()`
7. Nothing is shown when app is already in standalone mode

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Already in standalone | `isInstalled=true` — no prompt, no header button |
| Browser without `beforeinstallprompt` (Firefox) | `isInstallable=false` — no prompt, no header button (iOS prompt still shows for Safari) |
| iOS in standalone | `isInstalled=true` — nothing shown |
| `beforeinstallprompt` fires late (after first action) | Prompt shown on next render |
| User dismissed, then wants to install | Header button remains available |
| `localStorage` unavailable (private mode) | `isDismissed` always `false`, prompt shows each visit |
| Desktop Chrome | Shows Android-style prompt with install button (beforeinstallprompt) |
| Desktop Safari/Firefox | `isInstallable=false` — nothing shown (desktop browsers without PWA install support) |

---

## Non-Goals

- Push notifications
- Offline indicator
- Update prompt for new Service Worker (already handled by `registerType: 'autoUpdate'`)
- Install analytics/counting
- A/B testing different prompt designs
