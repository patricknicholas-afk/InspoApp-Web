# InspoAcademy Web Prototype — Changelog

All notable changes to the web prototype are documented here.
Format: `[YYYY-MM-DD]` · `Added` / `Changed` / `Fixed` / `Removed`

---

## [2026-03-09 — 2026-03-11] — Sessions 4-6 · Checkpoint: Design System, Navigation, Page Gates & Browse Overhaul

> **Milestone checkpoint** — Complete design system migration, hamburger nav for mobile, unauthenticated page gates for all main pages, and Browse page overhaul with search gate and inspiration carousels.

### Design System — Global Token Migration

#### Added
- **Font-weight tokens** — `--fw-regular` (400), `--fw-medium` (500), `--fw-demi` (600), `--fw-bold` (700), `--fw-heavy` (800/900) applied site-wide
- **Spacing tokens** — `--sp-xs` through `--sp-xxl`, `--grid-margin` responsive (16px mobile, 24px tablet, 32px desktop)
- **Chip tokens** — `--color-chip-bg`, `--color-chip-fg`, `--r-chip` (4px) unifying suggestion/selected/metadata chips
- **Avenir Next LT Pro** full weight family (`@font-face` for Regular, Medium, DemiBold, Bold, Heavy)

#### Changed
- **All hardcoded CSS values migrated** — colours, font sizes, weights, spacing, radii now use design tokens
- **Typography hierarchy standardised** — nav titles (demi), section headings (heavy), body copy (medium), account/preferences (demi with 1% letter-spacing)
- **Chip border-radius** — all chip variants changed from `999px` pill to `4px` square
- **Global `<button>` reset** — `border-radius: 4px` at base level; circular overrides for avatars, dots, action icons

---

### Navigation — Hamburger Menu + Icon Migration

#### Added
- **Hamburger nav** (`#hamburger-nav`) for unauthenticated mobile users (<768px) — floating dark drawer with Login button, page links, and "Create Account" CTA
- **`toggleHamburgerMenu()` / `closeHamburgerMenu()`** — drawer open/close with overlay backdrop
- **Heroicons migration** — all nav and UI icons replaced with Heroicons outline variants (24px consistent)

#### Changed
- **Bottom nav hidden** on unauthenticated hero pages; hamburger nav shown instead
- **Hero top nav** — hidden on mobile (<768px), visible on tablet/desktop with transparent background
- **Nav font weight** — standardised to demi (600) across all navigation elements
- **Bottom nav icons** — For You and Home changed from filled to outline SVGs

---

### Unauthenticated Page Gates

#### Added
- **Home gate** — full-screen hero carousel with inspiration imagery, "Create Like the Masters" headline, email capture CTA
- **Saved/Catalogue gate** — redesigned with centered title, body copy, dark hero banner, "Create Account" CTA
- **Exercises gate** — dark hero with pricing tiers and exercise preview carousel
- **Browse gate** — dark hero with search bar, autocomplete chips, guided search (see Browse section below)

#### Changed
- **All gate pages** share consistent dark hero pattern with `hero-top-nav` inline navigation
- **Mobile gate pages** show hamburger nav instead of bottom nav
- **Rename site-wide** — "For You" renamed to "Inspo", "Assignments" renamed to "Exercises" across all nav, pages, and copy

---

### Browse Page — Complete Overhaul

#### Added
- **`renderSearchGate()`** — unauthenticated Browse gate with dark hero, centered title/body, search bar with autocomplete
- **`renderBrowseCarousels()`** — authenticated Browse shows 3 L1 category carousels (Concept Design, Illustration, etc.) with horizontal scroll cards and "View All" buttons
- **`openBrowseCarouselModal()` / `browseViewAll()`** — carousel card taps open inspo modal; "View All" navigates to pre-filtered search results
- **`getL1Chips(limit)`** — returns top L1 categories by frequency from inspiration metadata

#### Changed
- **`renderSearch()` gate check** — `if (!currentUser) { renderSearchGate(); return; }` routes unauthenticated users to gate
- **Authenticated browse** — replaced static explore sections with dynamic category carousels

---

### Browse Gate Search — Unified Container & Responsive Chips

#### Added
- **`.search-gate__search-wrapper`** — unified container wrapping search bar, chips-row, and suggestions-row inside the hero
- **`.search-gate__search-row`** — flex row containing search bar + inline "Clear all" CTA
- **Single-line horizontal scroll** — `.search-gate__hero .chips-row` uses `flex-wrap: nowrap; overflow-x: auto; max-height: 44px` preventing hero expansion
- **Hidden scrollbar** — `scrollbar-width: none` (Firefox) + `::-webkit-scrollbar { display: none }` (Chrome/Safari)
- **Responsive wrapper width** — `max-width: 90%` on mobile, `70%` on tablet/desktop
- **Inline suggestion routing** — on gate, all suggestions go to `chips-row` (not separate `suggestions-row`), eliminating layout shift

#### Changed
- **Chips moved inside hero** — previously in a separate `.search-gate__chips` strip below the hero; now inside `.search-gate__content` within the hero
- **Clear all** — moved from appended to search bar to inline sibling in `.search-gate__search-row`
- **Hint text suppressed** — "Select one or more chips..." hidden on gate via `isGate` detection
- **Dark input overrides** — search input gets `rgba(255,255,255,0.1)` background, white text, white placeholder, white arrow

#### Fixed
- **Layout shift eliminated** — hero height stays constant (535px desktop, 609px mobile) regardless of chip state: empty, typed suggestions, selected chips + inline suggestions
- **Chip overflow on mobile** — `flex-wrap: wrap` was causing chips to wrap to 3 lines, expanding hero by 56px; fixed with `nowrap` + horizontal scroll
- **Suggestions-row expansion** — separate suggestions-row was adding 56px when suggestions appeared; fixed by routing all gate suggestions to chips-row
- **Wrapper width on mobile** — `max-width: 70%` produced only 262px at 375px viewport, forcing aggressive wrapping; changed to `90%` on mobile

---

### Inspiration Cards — UI Polish

#### Changed
- **For You card titles removed** — cleaner visual with tags only
- **Tag styling refined** — semi-transparent black background, bold weight
- **Hero banner title** — reduced to medium italic weight
- **Home banner CTAs** — aligned to bold 14px standard across all hero panels

---

### CSS / JS Versioning

| File | Start → End |
|------|-------------|
| `css/styles.css` | v=313 → v=388 |
| `js/app.js` | v=244 → v=319 |

---

## [2026-03-08] — Session 3 · Checkpoint: For You Feed & Metadata Tagging

> **Milestone checkpoint** — Full inspiration metadata tagging, searchable content, and polished For You feed experience for both authenticated and unauthenticated users.

### Inspiration Metadata — Complete 135-Image Tagging

#### Added
- **Full metadata tagging** across all 135 inspiration images in `data/inspiration.json` — 8 sections (3 original + 5 Discover Sets)
- **`industry` field** added to metadata schema with values: Character Design, Concept Art, Car Design, Illustration, Game Design, Environment Design, Figure Drawing, Portraits, Digital Painting
- Each item now has: `title`, `subtitle`, `industry[]`, `mediumTags[]`, `colorPalette[]`, `subjectMatter[]`, `techniqueVisible[]`

#### Removed
- **`mood`** and **`difficultyToRecreate`** fields removed from metadata schema (deprecated)

---

### For You Page — Card UI Overhaul

#### Added
- **`toTitleCase()` helper** (`app.js`) — converts tag text to consistent Title Case across all metadata tags
- **`isAuthed` flag** in `renderForYou()` — conditionally renders like/bookmark action buttons only for authenticated users

#### Changed
- **Tag styling** (`.foryou-card__tag`) — removed `border` (stroke), `background` changed to `rgba(26,26,26,0.25)` (off-black at 25% opacity), `font-weight: 700` (bold), `letter-spacing: -0.11px` (-0.9%)
- **Inspo title position** (`.foryou-card__inspo-title`) — moved from below tags to top-left of card; tags now hug the bottom padding
- **Tag overlay layout** (`.foryou-card__tag-overlay`) — changed from bottom-only gradient to full-inset flexbox with dual gradients (top + bottom) for title/tag separation
- **Action buttons** (`.foryou-card__action-btn`) — shrunk from `46px` → `34px` (25% reduction), gap `18px` → `14px`; SVG icons: heart `22×22` → `16×16`, bookmark `20×20` → `15×15`
- **Feed shuffle** — Fisher-Yates shuffle applied to `combined[]` array in `renderForYou()` so every page load produces a fresh random order
- **Pressable transforms reduced** — `.pressable:active` `scale(0.97)` → `scale(0.997)` (90% reduction); `.foryou-card__action-btn:active` `scale(0.86)` → `scale(0.93)`; `.inspo-modal__nav:active` `translateY(2px)` → `translateY(1px)`

---

### Browse & Search — Inspiration Metadata Integration

#### Fixed
- **`buildKeywordIndex()`** — fixed `window.INSPIRATION_DATA` → `INSPO_DATA` (keyword index was never reading inspiration metadata)
- **`industry` field** added to both keyword index builder and search results filter
- **Stale fields removed** — `mood` and `difficultyToRecreate` references removed from keyword index and search filter

#### Changed
- **Keyword index** grew from ~80 to 548 entries — now includes all inspiration metadata: industry, subjectMatter, techniqueVisible, colorPalette, mediumTags, titles, subtitles
- **Auto-suggest chips** now surface inspiration-specific terms (e.g. "Car Design", "Creature", "Painterly")
- **Search results** return matching inspiration cards alongside exercises

---

### Authentication — Login Page Navigation

#### Added
- **Auth page nav bar** (`.auth-nav`) — back arrow + "Home" / "For You" pill links; eliminates dead-end on login page
- **Mobile**: dark text on light surface, back arrow + both pill links visible
- **Desktop**: white back arrow over dark carousel panel, pill links hidden (back arrow sufficient)

---

### Unauthenticated Experience — Data Loading

#### Fixed
- **Cold boot data loading** — `exercises.json` and `inspiration.json` now fetched during unauthenticated `onAuthStateChanged` path, so For You feed works for guest users (previously data was only loaded after authentication)
- **Unauthenticated For You** — all 151 cards render (137 inspiration + 14 exercise), dark theme, no like/bookmark icons, full scroll

---

### CSS / JS Versioning

| File | Changes |
|------|---------|
| `css/styles.css` | Tag overlay layout, tag styling, action button sizing, pressable transforms, auth nav bar |
| `js/app.js` | `toTitleCase()`, feed shuffle, auth-gated actions, keyword index fix, data loading for guests, auth nav |
| `data/inspiration.json` | 135 items fully tagged with metadata |

---

## [2026-03-08] — Session 2

### Exercises Page — Generate Assignments UI Overhaul

#### Added
- **Generate Plan modal** (`openGenPlanModal()`, `closeGenPlanModal()`) — clicking "Generate Plan" now opens a centered overlay modal instead of rendering results inline; modal displays plan summary header, numbered exercise list, Download and Save Plan action buttons
- **Save Plan to localStorage** (`saveGenPlan()`, `getSavedPlans()`) — saves generated plans to `da_saved_plans` with metadata: `{ id, minutes, exerciseCount, totalTime, exercises, savedAt }`; button updates to "✓ Saved" after saving
- **`SAVED_PLANS_KEY = 'da_saved_plans'`** — new localStorage key for persisted lesson plans
- **`toggleSavedPlanExpand()`** — expand/collapse saved plan cards to reveal exercise list
- **`removeSavedPlan(planId)`** — removes a saved plan from localStorage and re-renders Saved page

#### Changed
- **`renderGenerateWidget()`** — removed ✦ AI star icon; removed wrapping div around title/subtitle; changed `.gen-widget__row` to `.gen-widget__session` (column layout with "SESSION" label above time chips)
- **`renderCoachWidget()`** — removed ✦ AI star icon and wrapping div
- **`generateLessonPlan()`** — now calls `openGenPlanModal()` instead of rendering inline into `#gen-results`; button text changes to "Regenerate" after first click
- **Generate Plan CTA** — full width within container, 8px border-radius
- **Session label** — all caps with 0.4px letter-spacing
- **Session time chips** (`.gen-pill`) — 4px border-radius (was 999px pill), `white-space: nowrap`
- **`.gen-widget` gap** — reduced from 16px to 12px for tighter layout
- **`.gen-widget__btn`** — `margin-top: auto` to push button to bottom of card; removed `max-width: 220px`
- **`.coach-upload-zone` padding** — reduced from 28px to 14px vertical to match card heights evenly

---

### Saved Page — Three-Tab Layout

#### Added
- **"Plans" tab** — third tab in Saved page tab bar alongside Inspiration and Exercises
- **Plans panel** (`data-panel="plans"`) — renders saved plan cards from `getSavedPlans()` with expand/collapse, remove button, exercise count, total time, and date saved
- **Saved plan card CSS** — `.saved-plan`, `.saved-plan__header`, `.saved-plan__exercises`, `.saved-plan__exercise` with numbered items, chevron rotation on expand

#### Changed
- **"Assignments" tab renamed to "Exercises"** — tab label and empty state copy updated
- **Empty state copy** — "Bookmark exercise cards from your feed to save them here." / "Browse Exercises"
- **Plans empty state** — "Generate a lesson plan from the Exercises page and save it here." / "Go to Exercises"
- **Empty state check** — now includes `hasPlans` in the fully-empty condition
- **`.saved-plan__exercises` gap** — 16px between expanded exercise row items

---

### Exercises Page — Layout Updates

#### Changed
- **Two-column layout** (`.exercise-tools-row`) — Generate Plan and AI Coach widgets side-by-side in a CSS grid; single column below 480px
- **Page heading** — "3-MINUTE EXERCISES" moved below the two-column widget row, above category dropdowns
- **Top margin** — 48px on desktop/tablet for `.exercise-tools-row` to clear the nav bar; 16px on mobile
- **Back button removed** from Exercises page nav bar (main nav page consistency)
- **Page title** — "Exercises" (was "All Exercises")
- **Bottom nav label** — "Exercises" (was "Assignments") in `index.html`

---

### Generate Plan Modal CSS

#### Added
- `.gen-plan-modal` — fixed overlay with `rgba(0,0,0,0.6)` backdrop, centered container
- `.gen-plan-modal__container` — white card, 16px radius, 420px max-width, 80vh max-height, scroll body
- `.gen-plan-modal__header` — title + close button with divider
- `.gen-plan-modal__body` — scrollable exercise list reusing `.gen-results__item` markup
- `.gen-plan-modal__actions` — bottom action bar with Download + Save Plan buttons

---

### Browse & Search — Grid Layout + Chip Updates

#### Added
- **Responsive grid** (`.search-results__grid`) — 3-column on desktop/tablet, single column on mobile with `nth-child(n+9)` cap
- **"View All" drill-down pages** — `renderAllInspo()` and `renderAllExercises()` for full result lists; `.search-results__grid--all` modifier bypasses mobile cap
- **"View All" CTA** — secondary button style (2px black outline, all caps, 4px radius); hidden on desktop

#### Changed
- **Chip border-radius** — `.suggestion-chip`, `.selected-chip`, `.explore-chip`, `.search-results__chip` all updated from 999px to 4px
- **`.search-results__scroll`** replaced with `.search-results__grid` across search results rendering

---

### Saved Page — Bug Fixes & Polish

#### Fixed
- **Saved inspiration not rendering** — `toggleInspoSave()` now stores `imageUrl` parameter; `renderBookmarks()` builds image lookup from both `FY_TAG_CARDS` and `INSPO_DATA`, with `item.imageUrl` fallback
- **Saved page title** — centered via `text-align: center` on `.saved-nav__title-row`

---

## [2026-03-08]

### Firebase Auth + Firestore Emulator Integration

#### Added
- **Firebase JS SDK v10.14.1** (compat build) loaded via CDN in `index.html` — `firebase-app-compat.js`, `firebase-auth-compat.js`, `firebase-firestore-compat.js`
- **Firebase app initialisation** in `app.js` — project ID `drawingapp-test`, pointed at local emulators (`fbAuth.useEmulator('http://127.0.0.1:9099')`, `fbDb.useEmulator('127.0.0.1', 8080)`)
- **`loadUserProfile(uid, fallbackEmail)`** — fetches Firestore `users/{uid}` doc and populates the global `currentUser` object (`name`, `email`, `photoInitials`, `photoColor`) from real data
- **`nameToColor(name)`** — deterministic avatar colour derived from display name; cycles through a 10-colour neutral palette
- **`showAuthError(msg)`** — inline error display below the auth card; auto-clears after 5 s
- **`_authBootDone` flag** — prevents double-boot on rapid Firebase auth state changes
- **Firebase emulator warning banner** — Firebase SDK automatically renders the red "Running in emulator mode" bar at the bottom of the page (expected, confirms emulator connection)

#### Changed
- **`DOMContentLoaded` init** — replaced `await loadData()` with a persistent `fbAuth.onAuthStateChanged()` listener; handles cold load (no session), sign-in, and sign-out transitions
- **`signInWithGoogle()`** — now calls `fbAuth.signInWithEmailAndPassword('alex.beginner@test.drawingapp.com', 'testpass123')` against the Auth emulator (real Google OAuth not available in emulator); `onAuthStateChanged` drives the rest
- **`signInWithEmail()`** — now calls `fbAuth.signInWithEmailAndPassword(email, 'testpass123')`; shows inline error if email not found
- **`verifyOTP()`** — now calls `fbAuth.signInWithEmailAndPassword(email, 'testpass123')` in emulator mode; `onAuthStateChanged` closes modal and boots app
- **`signOut()`** — now calls `fbAuth.signOut()` first (clears IndexedDB session) before resetting local state
- **`checkAuth()`** — simplified to `return !!currentUser` (no longer reads `da_user` from localStorage; Firebase handles session persistence via IndexedDB)
- **`loadData()`** — now clears all active pages before activating `page-home`, fixing a bug where the auth page remained visible after Google-button sign-in
- `localStorage.setItem('da_user', ...)` removed from all sign-in paths — session state owned by Firebase Auth

#### Test Users (all password: `testpass123`)
| Email | Name |
|-------|------|
| `alex.beginner@test.drawingapp.com` | Alex Chen |
| `jordan.arch@test.drawingapp.com` | Jordan Rivera |
| `morgan.pro@test.drawingapp.com` | Morgan Blake |
| `casey.shade@test.drawingapp.com` | Casey Tran |
| `taylor.hobby@test.drawingapp.com` | Taylor Kim |
| `sam.new@test.drawingapp.com` | Sam Johnson |
| `riley.digital@test.drawingapp.com` | Riley Okafor |
| `jamie.busy@test.drawingapp.com` | Jamie Lee |
| `avery.pleinair@test.drawingapp.com` | Avery Santos |
| `drew.bookmarks@test.drawingapp.com` | Drew Martinez |

---

### CSS / JS Versioning

| File | Start → End |
|------|-------------|
| `js/app.js` | v=66 → v=68 |

---

## [2026-03-07]

### End-of-Day Audit — Top Issues Found
> Full report in `AUDIT_LOG.md`

- **H1 — `bookmarks` Set not persisted:** Exercise bookmarks lost on page reload; needs `localStorage.setItem('da_bookmarks', ...)` wired into `toggleBookmark()`
- **H2 — Missing null checks:** `renderExerciseDetail()` and `renderVideoPlayer()` crash if `categories.find()` returns `undefined`
- **M1 — Duplicate menu toggle logic:** `toggleUserMenu()` and `toggleHomeUserMenu()` are near-identical; extract to shared `toggleMenu(menuId, e)` utility

---

### Authentication & Auth Flow

#### Added
- **Mock authentication flow** with three sign-in methods: Google OAuth (simulated), email/password, and magic link (OTP modal)
- **`bootAuthenticatedApp()`** — post-login bootstrap function that renders the global avatar, transitions to the home page, and loads data
- **`checkAuth()`** — reads `da_user` from localStorage on page load to restore session for returning users
- **`signOut()`** — clears localStorage, resets state, returns user to unauthenticated home
- **Auth gate pages** for unauthenticated users attempting to access Saved (`renderSavedGate()`) and Assignments (`renderAssignmentsGate()`) — shows icon, headline, body copy, "Create Account" CTA, and "Login" link
- **`renderGlobalAvatar()`** now called in both `bootAuthenticatedApp()` and `loadData()` to ensure the avatar pill is populated after login and on page reload

#### Changed
- `handleBottomNav()` now checks `currentUser` before routing to Saved/Assignments; unauthenticated users see gate screens instead
- Global avatar pill (`#global-user-pill`) now shows on **all pages** when authenticated, except `page-auth` (login screen) and `page-home` (has its own auth bar)

---

### Login Page (`renderAuth()`)

#### Added
- **Left panel image carousel** — vertical infinite-scroll animation using 11 real images from `assets/img/`; seamless loop achieved by duplicating the image list and animating `translateY(-50%)`
- Carousel settings: `112px` container padding, `32px` gap between images, `20px` rounded corners, heavy black drop shadow, `#1a1a1a` background, `58s` scroll speed (no hover-pause)
- **InspoAcademy horizontal logo** (`assets/img/logo-horizontal.png`) centered above the form at `263px` width
- Login page title updated to **"Unlimited inspiration awaits."** (18px, Avenir Next, weight 600)
- Body copy updated to **"Sign in for full access to inspiration, creative habits, and exercises to improve."**
- "Use a magic link" link set to `font-weight: 700`

#### Changed
- Removed the "Genius Academy" brand block (title, body copy, icon) from the right panel
- Right panel now leads with logo → title → body → form fields

#### Fixed
- Email input autofill: browser webkit-autofill was injecting a white background; fixed with `box-shadow: 0 0 0 1000px #1a1a1a inset !important` on `:-webkit-autofill` pseudo-class
- Email input focus state now correctly shows `#1a1a1a` background with no outline ring

---

### Home Page — Unauthenticated

#### Changed
- Hero "Login" button is hidden for authenticated users (unauthenticated path only)
- `renderHome()` now branches immediately: authenticated users → `renderAuthHome()`, unauthenticated users → existing hero panel flow

---

### Home Page — Authenticated Dashboard (`renderAuthHome()`)

#### Added
Full authenticated home page replacing the unauthenticated hero panels with a personalised dashboard:

- **Section 1 — "What are we working on today?"**
  White card with title, subtitle, **Continue** (primary) and **Want suggestions?** (secondary) buttons

- **Section 2 — Find Inspiration**
  Full-bleed dark gradient banner; tapping navigates to the For You feed

- **Section 3 — Swipable Exercises**
  Two-panel slider (Completed Exercises / Saved Exercises) with:
  - Dot indicators that update on panel change
  - Touch swipe support (≥40px threshold)
  - Up to 3 items per panel with empty states and contextual CTAs
  - "View all" link when saved count exceeds 3
  - Data sources: `da_completed` localStorage (completed) and existing `bookmarks` Set (saved)

- **Section 4 — Products We Love**
  Horizontal scroll carousel of 6 product cards (160×160 colour placeholder + title + body); scroll-snap for clean stopping; first/last cards flush with grid margin

- **Section 5 — "Want more from this product?"**
  Centred card with title, subtitle, **Donate** (primary) and **Feedback** (secondary) stacked CTAs

- **Welcome top bar** (`home-auth-bar`) — fixed overlay with "Welcome, [firstName]" in off-black (`#1a1a1a`) + avatar button with flyout menu (Account / Preferences / Log Out)
- `toggleHomeUserMenu()` / `closeHomeUserMenu()` functions (separate from global pill menu to avoid conflicts)
- Global avatar pill hidden on `page-home` — home auth bar handles it

---

### For You Page

#### Added
- **Like button** (heart icon) on each For You card — right-side vertically stacked; active state fills heart red/pink
- **Bookmark button** (bookmark icon) on each For You card — active state fills icon solid white
- `toggleForYouLike(exId, ...)` — writes to `da_liked_items` localStorage with metadata: `{ id, title, category, categoryTag, likedAt }`
- `toggleForYouBookmark(exId, ...)` — writes to `da_saved_inspiration` localStorage; refreshes Saved page if open
- `getLikedItems()` / `getSavedInspo()` localStorage helpers
- Initial active state (filled icons) restored from localStorage on every `renderForYou()` call

#### Changed
- **Unauthenticated**: background `#141414` (off-black), dark bottom nav — via `.foryou-page--dark` modifier class
- **Authenticated**: background `var(--color-surface-bg)` (off-white), light bottom nav
- `.foryou-card { background: transparent }` — previously `#eff0f5` was covering the page background

---

### Saved Page (`renderBookmarks()`)

#### Changed
- Refactored from a single-section list to **two independent sections**:
  - **Saved Inspiration** — items bookmarked from the For You feed (`da_saved_inspiration`)
  - **Saved Assignments** — exercises bookmarked from exercise/detail pages (existing `bookmarks` Set)
- Each section has its own empty state with a contextual CTA
- Combined empty state shown only when both sections have zero items
- Remove button on Saved Inspiration rows calls `toggleForYouBookmark()` to unsave

---

### Navigation

#### Changed
- **Authenticated state**: bottom nav always uses light design on all pages
- **Unauthenticated state**: dark nav (`bottom-nav--dark`) only on `page-home` and `page-foryou`
- Logic: `const isDarkNav = !currentUser && (pageId === 'page-home' || pageId === 'page-foryou')`

---

### Global Avatar Pill

#### Fixed
- Avatar pill was empty after login — `renderGlobalAvatar()` was never called post-auth; fixed in both `bootAuthenticatedApp()` and `loadData()`
- Avatar pill now correctly visible on: For You, Exercises, Exercise Detail, Video Player, Article, Search, Saved, Account, Preferences

---

### Design System

#### Added
- **Global 4px border-radius** on all `<button>` elements — locked in at the base `button {}` reset level
- Circular override group: `.user-pill__avatar`, `.home-auth-bar__avatar`, `.foryou-card__action-btn`, `.dash-slider__dot`, `.hero-dot` retain `border-radius: 50%`

#### Changed
- Logo on login page: replaced brain-only mark with horizontal lockup (`InspoAcademy-logo-horizontal.png`), sized to `263px` width
- Auth card title: `font-size: 18px`, `font-weight: 600`

---

### CSS / JS Versioning

| File | Start → End |
|------|-------------|
| `css/styles.css` | v=75 → v=84 |
| `js/app.js` | v=57 → v=66 |

---

## Log Format Guide

When updating this file in future sessions, append a new dated section at the top using:

```
## [YYYY-MM-DD]

### Feature / Area Name

#### Added
- ...

#### Changed
- ...

#### Fixed
- ...

#### Removed
- ...
```

Keep entries concise but specific — include component names, CSS class names, function names, and localStorage keys where relevant so future sessions can reference them quickly.
