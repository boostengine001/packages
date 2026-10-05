# Changelog

All notable changes to `@boostengine/ui` are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/).

## [2.1.5] — 2026-10-04

## [2.1.6] — 2026-10-04

### Fixed
- **npm tarball slimmed**: the 21 unit-test files that shipped inside `src/components/` are now excluded from the published package (264 -> 243 files). The shadcn-style CLI still reads component sources as before.
- CI runners pinned to `ubuntu-24.04` ahead of GitHub's Oct 19 Ubuntu 26 image migration, keeping visual pixel-diff baselines stable.

### Changed
- CI actions updated to latest majors (checkout@v7, setup-node@v7, upload-artifact@v7) — Node 20 deprecation warnings resolved.
- Test suite grown to 358 tests; statement coverage ~61% (CI thresholds raised to 58/46/62/60).
- Docs playground now deploys to GitHub Pages (`.github/workflows/docs.yml`) under `/packages/` with a subpath-aware Ladle build.
- New `package Release` workflow: any of the 28 sibling packages can be released through GitHub Actions with typecheck + build + test gates and npm provenance.
### Changed
- CI actions updated where applicable; runner Node deprecation warnings addressed.

## [2.1.7] — 2026-10-04

### Fixed
- `DateRangePicker`: fully controlled with no internal state — without a `value` prop, typing updated nothing and end-date min enforcement never engaged. Now dual-mode (controlled or self-managed); `endDate` acts as the initial value.

### Changed
- README: fixed broken local `file:///` documentation links; added Live Docs badge and playground link.
- `llms.txt` / `llms-full.txt`: version updated, live playground URL added for AI agents.

## [2.1.8] — 2026-10-05

### Fixed
- **Dark mode hardening** (user-reported): 143 hardcoded inline-style colors converted to semantic CSS variables so components follow BoostProvider's dark tokens — text, muted text, surfaces, borders, primary and semantic colors now invert correctly in dark mode across PricingTable, RegisterForm, CartDrawer, CTASection, Tag, Accordion, LoginForm, Navbar, DataTable and ~40 more components. Light rendering is unchanged.
- `HeroSection` (minimal preset): primary button was invisible in dark mode (white text on a near-white `--boost-text` background). Label now uses `var(--boost-bg)` and inverts with the theme.

### Added
- Visual suite now covers dark mode permanently: 99 scenarios (7 presets × 7 components × light+dark), pixel-diffed on both linux and win32 baselines.

## [Unreleased]

### Added
- **SSR safety suite**: 115 components rendered with react-dom/server in a plain Node environment — proves the suite is genuinely server-render safe. Found and fixed an unguarded `item.user` access in `ActivityFeed`.
- **Real-browser visual suite (Playwright + Chromium)**: 49 scenario screenshots across all 7 design presets × 7 key components, asserting zero console errors and zero uncaught exceptions. Runs in CI with screenshot artifacts.
- **Coverage thresholds enforced in CI** (statements/branches/functions/lines gated — regressions fail the build). Statement coverage now ~49% (up from ~4.5% at adoption).
- **Pixel-diff baselines** for the visual suite: `toHaveScreenshot` comparisons with CI-generated baselines (runner-consistent fonts) and diff artifacts on failure.
- **Component playground (Ladle)**: `npm run docs` serves 40+ interactive stories across buttons, forms, feedback, commerce, dashboard and marketing blocks.
- **Monorepo CI for all 28 sibling packages** (`.github/workflows/packages-ci.yml`): per-package matrix running install -> typecheck -> build -> tests.
- **Type-safety sweep**: all 98 `no-explicit-any` warnings resolved — lazy casts replaced with real types; data-grid and form-generic boundaries carry documented, justified exceptions. ESLint is now **0 errors / 0 warnings**.
- Wired previously inert props: `AnnouncementBar.stylePreset` now applies preset styling; `TestimonialCard.avatar` alias renders; MultiSelect dropdown gained full arrow-key navigation and roving tabindex (invalid `aria-highlighted` replaced with `data-highlighted`).
- Added CODEOWNERS; coverage now ~57% statements with 337 tests.

## [2.1.4] — 2026-10-04

### Added
- **Real unit test suite (84 tests)** with Vitest + React Testing Library + jsdom (`npm run test:unit`), covering Modal (focus trap, Escape, scroll lock, ARIA), Tabs (keyboard nav, controlled/uncontrolled, compound API), Accordion, Toast, `useForm`, utility hooks, and all utility functions. Coverage reporting via `npm run test:coverage`.
- **GitHub Actions CI** (`.github/workflows/ci.yml`): lint → typecheck → unit tests → build → smoke tests on every push/PR touching `boost-ui`.
- **Manual release workflow** (`.github/workflows/release-boost-ui.yml`): verifies and publishes to npm with provenance via `workflow_dispatch`.
- **ESLint 9 (flat config) + Prettier** with `typescript-eslint`, `react-hooks` (rules-of-hooks as error), and `jsx-a11y` plugins. `npm run lint` / `npm run format`. A11y and `no-explicit-any` findings are tracked as a warning baseline (0 errors) to be promoted per-rule as components get fixed.

### Fixed
- **Modal focus trap never attached**: the trap effect ran before the Portal mounted and never re-ran, so focus was never moved into the dialog and Tab was never trapped — in production, not just tests. `useFocusTrap` now accepts a state-held element (refs still supported) and Modal passes one, so the trap re-attaches when the Portal DOM exists.
- **`rules-of-hooks` violations in 7 components**: conditional `React.useId()` calls (`AreaChart`, `DatePicker`, `Grid`, `Sparkline`, `StarRating`, `Tooltip`) and `useState`/`useEffect` after an early return (`ProductGallery`) could crash or misbehave when render branches changed. Hooks are now called unconditionally at the top of the component.
- **`formatRelativeTime`** produced "in 2 days from now" for future dates; now returns "in 2 days" (matches the documented example).
- **`isValidIndianMobile`** rejected `+91`-prefixed numbers; now normalizes `+91`/`91`/`0` prefixes before validating.

### Changed
- `prepublishOnly` now runs the full gate: lint → typecheck → unit tests → build → smoke tests.
- Codebase formatted with Prettier (single config, normalized line endings); removed dead code (unused style helpers/constants) and junk files (`err.txt`, `out.txt`, `build_log.txt`).

### Added (a11y & quality hardening)
- **All 102 jsx-a11y findings fixed** — every interactive element now has keyboard support (Enter/Space handlers, roving focus), all form labels are programmatically associated, overlays close via Escape, and `ProgressBar` exposes proper `role="progressbar"` semantics. jsx-a11y rules are enforced as **errors** in lint (documented exceptions carry justifying comments).
- **Test suite grown from 84 to 158 tests across 18 files**, covering forms (Input/Textarea/Select/Checkbox/Switch/Radio), display components (Alert/Badge/Avatar/ProgressBar/EmptyState), navigation (Breadcrumb/Pagination/Stepper/DropdownMenu), commerce widgets (Price/QuantitySelector/StarRating/PincodeChecker/CartDrawer), data display (DataTable/KPIWidget/charts), and system pieces (BoostProvider/ThemeToggle/Portal/Carousel/Tooltip). Statement coverage up from ~4.5% to ~25%.
- **8 react-hooks/exhaustive-deps warnings resolved** (stable callbacks in Carousel, correct dependency arrays in Popover/MegaMenu/LightningDealsBar, module-level breakpoint table).
- **Build & packaging hardening**: sourcemaps enabled, `publint` clean (types nested per import/require condition, `type: commonjs` declared), `size-limit` guards (full bundle < 100 kB brotli; tree-shaken utils 127 B, hooks 688 B).
- Repository links updated to the boostengine001 org; `dist` untracked from git; SECURITY.md and GitHub issue templates added.
- Fixed: PricingTable crashed when a tier omitted optional-looking features data; ThemeToggle segmented variant references verified.

## [2.0.0] — 2026-09-21

### Major Changes
- **Universal Multi-Theme Design Presets Engine**:
  - Full system-wide support for 7 aesthetic design presets: `minimal`, `glassmorphism`, `neumorphism`, `neo-brutalism`, `dark-first`, `gradient-glow`, and `material-you`.
  - Added `BoostProvider` with reactive `useBoostPreset()` hook and `PresetSwitcher` floating/dockable control widget.
  - Complete preset coverage across all 121 exported components with zero external CSS dependencies.
  - Per-component theme override via `stylePreset` prop.
  - Hardcoded stable Material You corner radius (`24px`) for optimal cross-platform compatibility.

## [1.8.2] — 2026-09-20

### Added
- **Design System Tokens & Tailwind Integration**:
  - Exported standard Design Tokens JSON (`tokens.json` / `@boostengine/ui/tokens.json`) compatible with Figma Tokens Studio & Style Dictionary.
  - Exported `boostTokens` typed object in TypeScript/JavaScript.
  - Exported `createTailwindPreset()` helper for zero-config Tailwind CSS mapping.
  - Added `docs/THEMING_AND_TOKENS.md` detailing token structure, provider theming, and CSS variable specifications.
- **Enterprise DataTable**:
  - Multi-row selection with checkboxes (`selectable`, `selectedRows`, `onSelectionChange`, select all header checkbox).
  - Column sorting with visual indicators (`sortable`).
  - Sticky header support (`stickyHeader`) and customizable scrollable container height (`maxHeight`).
  - Built-in one-click CSV export (`exportable`, `exportFilename`).
  - Server-side / manual pagination integration (`manualPagination`, `totalCount`, `page`, `onPageChange`).
- **Asynchronous Toast Lifecycle (`toast.promise`)**:
  - Implemented `toast.promise<T>(promise, { loading, success, error }, options)` in `ToastProvider` and safe fallback in `useToast`.
  - Seamlessly transitions notification state from loading spinner to success/error message with auto-dismiss.
- **Strict Polymorphism**:
  - Created strict polymorphic typing system (`src/types/polymorphic.ts`) enabling typesafe `as` prop forwarding with full ref support.
  - Expanded `Box` component to support any HTML element (`p`, `a`, `button`, `ul`, `form`, etc.) and custom elements.
- **Form State Enhancements (`useForm`)**:
  - Added `validationSummary` string array for centralized form error banners.
  - Added `getFieldError`, `setFieldValue`, `setFieldError`, `hasErrors`, and `isValid` utilities.
- **Comprehensive Documentation & Accessibility Audit**:
  - Added `docs/COMPONENTS_REFERENCE.md` with complete API matrix, props, variants, edge cases, and TypeScript examples.
  - Added `docs/A11Y_AUDIT.md` with WAI-ARIA 1.2 compliance matrix, keyboard navigation specs, focus trapping rules, and WCAG 2.1 AA/AAA contrast ratios.

## [1.8.1] — 2026-09-20

### Fixed
- **Tree-Shaking & Bundle Size Optimization**:
  - Moved DOM stylesheet injection from module load time into `BoostProvider`'s `useEffect` / `injectBoostGlobalStyles()`, restoring full `sideEffects: false` compliance for bundlers (esbuild, webpack, Rollup).
  - Shipped dedicated `@boostengine/ui/styles.css` standalone stylesheet for zero-JS CSS importing.
  - Enabled ESM code splitting (`splitting: true`) in `tsup.config.ts`.
  - Added `/* @__PURE__ */` annotations across all `React.forwardRef` component calls, ensuring dead-code elimination.
  - Disabled sourcemap generation in distribution (`sourcemap: false`) and trimmed package `files` field to eliminate 2.7 MB bloat and prevent shipping full test fixtures.
- **SSR Crash & Zero-Prop Resilience**:
  - Provided safe default values (`= []`, `= false`, `= 0`, `= () => {}`) across 21 components (`Select`, `Accordion`, `Table`, `Stepper`, `PricingTable`, `VariantSelector`, `DataTable`, `MultiSelect`, `Sort`, `Sidebar`, `RadioGroup`, `ProductCard`, `StickyAddToCart`, `OrderSummary`, `FrequentlyBoughtTogether`, `DualMobileActionBar`, `CartDrawer`, `ActivityFeed`, `CommandPalette`, `NotificationCenter`, `Breadcrumb`, `Filter`, `FeatureGrid`, `LogoCloud`, `FAQSection`, `TestimonialGrid`).
  - Rendering any component without props or during SSR now renders safely without throwing `TypeError: Cannot read properties of undefined`.
- **WAI-ARIA & Accessibility Upgrades**:
  - `DropdownMenu`: Added `role="menu"`, `role="menuitem"`, arrow key navigation (`ArrowDown`, `ArrowUp`, `Home`, `End`), and Escape key dismissal with focus restoration.
  - `DatePicker`: Added `htmlFor` label linkage, explicit `aria-label`, `aria-invalid`, `aria-describedby`, and keyboard Enter/Space triggers.
  - `Tooltip`: Added Escape key dismissal, `role="tooltip"`, and `aria-describedby` trigger association.
- **Universal Locale & Currency Support**:
  - Migrated hardcoded `INR`/`₹` and `en-IN` defaults to universal configurable `$` / `USD` and `en-US`.
  - Added `useCurrency()` hook and `currency` / `locale` context to `BoostProvider`.
  - Added `currencySymbol` and `locale` props across e-commerce components (`ProductCard`, `StickyAddToCart`, `Price`, `OrderSummary`, `FrequentlyBoughtTogether`, `DualMobileActionBar`, `CartDrawer`, `VariantSelector`).
  - Added international postal code validation (`/^[\w\d\s-]{3,10}$/i`) to `PincodeChecker` and `AddressForm`, supporting both worldwide ZIP/postal codes and PIN codes.
  - Internationalized `Footer` payment badges and default descriptions.
- **Developer Experience (DX)**:
  - Made `ProductCardProps.id` optional (`id?: string`), resolving strict TypeScript errors when passing mock data.
- **Repository Links**:
  - Corrected `homepage` and `repository.directory` to point to `boost-ui` in `package.json`, resolving 404 links on npmjs.com.

## [1.8.0] — 2026-09-20

### Added
- **Enterprise WAI-ARIA Accessibility Engine**:
  - `useFocusTrap` — Trap focus automatically inside overlays (`Modal`, `Drawer`) preventing tab cycling outside active dialogs. Auto-focuses the first interactive element.
  - `useAnnounce` — Offscreen live region hook for dynamic screen reader announcements (`polite` / `assertive`).
  - `Tabs` — Full WAI-ARIA arrow key navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`) with `aria-controls` & `aria-labelledby` tabpanel linking.
  - `Accordion` — Keyboard arrow navigation across accordion headers with region aria tags.
  - `Input` & `Textarea` — Native `aria-invalid` and `aria-describedby` linking errors directly to screen readers with `role="alert"`.
  - `Toast` — Dynamic `role="alert"` vs `role="status"` and `aria-live` assertive/polite differentiation based on severity.

## [1.7.0] — 2026-09-20

### Added
- **Production Interactive Examples & Templates**:
  - Full modern D2C Storefront layout with Hero, Deals, and Collections.
  - Merchant Analytics & SaaS Dashboard with charts, KPI cards, and activity feed.
  - Multi-step Express Checkout page with delivery address validation and payment gateways.
  - Auth flow pages (Modern Login & Register) with Indian phone number support and OTP verification.
  - Settings & Team management preferences workspace.
- Enhanced publish automation script with directory self-resolution.

## [1.6.1] — 2026-09-19

### Changed
- Refactored component exports and build optimizations.

## [1.6.0] — 2026-09-19

### Added
- **Zero-Dependency SVG eCommerce Chart Suite**:
  - `AreaChart` — High-performance SVG area/line chart with gradient fill, auto-scaling Y-axis, gridlines, comparison series, and interactive hover tooltips.
  - `BarChart` — Rounded-top SVG bar chart with auto-scaling, dual series comparison, and hover cards.
  - `DonutChart` — SVG trigonometric arc donut/pie chart with center metric display and interactive legend.
  - `Sparkline` — Ultra-compact micro-trend SVG line chart with auto green (rising) / red (falling) color detection.
- **New Layout Primitives**:
  - `Breadcrumb` — Responsive hierarchical navigation trail with home icon and custom separators.
  - `Divider` — Horizontal and vertical separator with optional center label/badge.
  - `Stack`, `HStack`, `VStack` — Flexbox layout primitives with gap, align, justify, and responsive wrap.
- **Navbar Modernization**:
  - Top announcement banner with link and dismiss callback.
  - Multi-level dropdown menus via `NavLinkItem.children` with chevron rotators and mobile drawer accordion collapse.
- **Footer Modernization**:
  - Added `variant="dark" | "light" | "surface"` prop.
  - Custom inline newsletter email validation with zero browser alerts.

### Changed
- **Form Validation Overhaul**:
  - Added `noValidate` on `LoginForm`, `RegisterForm`, `AddressForm`, and `Footer` newsletter forms to suppress native browser tooltips.
  - Added custom inline regex checks for email, 10-digit Indian mobile numbers, 6-digit Indian PIN codes, password length, and full names with red border highlights and micro-copy helper messages.
- **Dark Mode Contrast Fix**:
  - Replaced hardcoded `#ffffff` in `Sidebar.tsx` with `var(--boost-surface)` and `var(--boost-border)`.
- `package.json` version bumped to `1.6.0`.

---

## [1.4.0] — 2026-09-18

### Added
- **New Components**:
  - `Portal` — SSR-safe React DOM portal rendering to document.body, used by `Modal` and `Drawer`.
  - `Motion` — Zero-dependency scroll & entrance animations (`slide-up`, `fade-in`, `scale-in`, etc.) powered by native `IntersectionObserver`.
- **New Utility Hook**:
  - `useForm` — Lightweight, type-safe form management hook with real-time validation and async submission status.
- **Utility Hooks** — 12 SSR-safe hooks exported directly from package root and `@boostengine/ui/hooks`:
  - `useForm`, `useMediaQuery`, `useClickOutside`, `useDebounce`, `useLocalStorage`, `useWindowSize`, `useScrollPosition`, `usePrevious`, `useCopyToClipboard`, `useToggle`, `useIntersectionObserver`, `useIsomorphicLayoutEffect`.
- **Utility Functions** — 18 utilities exported from package root and `@boostengine/ui/utils`:
  - `cn()`, `formatCurrency()`, `formatNumber()`, `formatDate()`, `formatRelativeTime()`, `truncate()`, `slugify()`, `generateId()`, `clamp()`, `groupBy()`, `deepMerge()`, `omit()`, `pick()`, `debounce()`, `getInitials()`, `isValidEmail()`, `isValidIndianPincode()`, `isValidIndianMobile()`.
- **Subpath Exports** — Official support for `@boostengine/ui/hooks` and `@boostengine/ui/utils` in `package.json`.
- **Tree-Shaking & Performance** — Added `"sideEffects": false` and `"engines": { "node": ">=18.0.0" }`.
- **Accessibility & Form Integration** — Added `React.forwardRef` and `displayName` to `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `OTPInput`, and `SearchInput`.
- **No-Provider Fallback** — Injected static default CSS variables and keyframes at module load time in `BoostProvider`.
- **Upgraded `llms-full.txt` & `llms.txt`** — Complete specs for all 115 components and full page templates.
- **Upgraded `test-suite.cjs`** — Comprehensive test coverage across all components, hooks, utils, and package.json configuration.

### Changed
- `package.json` version bumped to `1.4.0`

---

## [1.3.0] — 2026-09-17

### Added
- **Marketing Blocks** — `HeroSection`, `FeatureGrid`, `PricingTable`, `TestimonialCard`, `TestimonialGrid`, `FAQSection`, `LogoCloud`, `CTASection`
- **SaaS Dashboard Blocks** — `KPIWidget`, `CommandPalette`, `ActivityFeed`, `NotificationCenter`
- **File Handling** — `FileDropzone` (drag-and-drop with preview), `ExportButton` (CSV/Excel/PDF/JSON)
- **Data Table** — `DataTable` with search, sort, and pagination
- **CLI Tooling** — `npx @boostengine/ui add <component>`, `npx @boostengine/ui list`, `npx @boostengine/ui init`
- **AI Documentation** — `llms.txt` and `llms-full.txt` machine-readable manifests
- **Advanced Forms** — `DateRangePicker`, `MultiSelect`, `FileDropzone`, `OTPInput`

### Changed
- `BoostProvider` now supports `darkTokens` prop for independent dark-mode token overrides
- All components now use CSS variable references (`var(--boost-*)`) for themeable surfaces

---

## [1.2.0] — 2026-09-10

### Added
- **E-Commerce Suite** — `CartDrawer`, `StickyAddToCart`, `PincodeChecker`, `TrustBadges`, `OrderTimeline`, `ProductCard`, `ProductGallery`, `VariantSelector`, `QuantitySelector`, `ReviewBreakdownBars`
- **Indian D2C Specific** — `AnnouncementBar`, `LightningDealsBar`, `FrequentlyBoughtTogether`, `BankOffersAccordion`, `AssuredBadge`, `DualMobileActionBar`
- **Checkout Suite** — `Price`, `AddToCart`, `CouponInput`, `AddressForm`, `OrderSummary`
- **Authentication** — `LoginForm`, `RegisterForm`, `ForgotPassword`, `ResetPassword`

---

## [1.1.0] — 2026-09-05

### Added
- **Layout Primitives** — `Box`, `Flex`, `Stack`, `VStack`, `HStack`, `Grid`, `GridItem`, `Section`, `AspectRatio`, `ScrollArea`, `Container`, `PageWrapper`
- **Navigation** — `Navbar`, `Sidebar`, `Footer`, `MobileBottomBar`, `MobileBottomNav`, `MegaMenu`, `DropdownMenu`
- **Theming Engine** — `BoostProvider` with CSS variable injection, `useTheme` hook, automatic system/dark/light mode

---

## [1.0.0] — 2026-09-01

### Added
- Initial release with 30 core components
- `Button`, `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, `Modal`, `Drawer`, `Toast`, `Alert`, `Card`, `Badge`, `Avatar`, `Tooltip`, `Accordion`, `Carousel`, `Table`, `Pagination`, `Tabs`, `Breadcrumb`, `Skeleton`, `Loader`, `Spinner`, `ProgressBar`, `EmptyState`, `Stepper`, `StarRating`, `Divider`, `Tag`, `Chip`
- Zero external CSS dependency architecture
- TypeScript-first with complete type declarations
- Next.js App Router compatible (`'use client'` banner injection)
