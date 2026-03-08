# InspoAcademy Web Prototype — Audit Log

End-of-session audit reports are appended here automatically when you say **"we are done for the day"**. Each entry cross-references the CHANGELOG, identifies bugs, inconsistencies, and inefficiencies, and suggests fixes.

---

## [2026-03-07] — Session Audit

### Overall Status: ✅ Functional — No critical breakage

---

### 🔴 High Priority

#### H1 — `bookmarks` Set not persisted to localStorage
- **File:** `js/app.js` line ~1551 (`saveLessonPlan()`)
- **Issue:** The `bookmarks` Set (which powers Saved Assignments) lives in memory only. On page reload, all exercise bookmarks are lost. `da_liked_items` and `da_saved_inspiration` correctly use localStorage but `bookmarks` does not.
- **Fix:** On every `toggleBookmark()` call, sync to localStorage:
  ```js
  localStorage.setItem('da_bookmarks', JSON.stringify([...bookmarks]));
  ```
  And in `checkAuth()` / `loadData()`, restore:
  ```js
  bookmarks = new Set(JSON.parse(localStorage.getItem('da_bookmarks') || '[]'));
  ```

#### H2 — Missing null checks on category/exercise lookups
- **File:** `js/app.js` lines ~1833–1834, ~1902–1903, ~2332
- **Issue:** `APP_DATA.categories.find(...)` returns `undefined` if the ID doesn't match. The next line immediately accesses `.exercises` on the result, causing a TypeError crash.
- **Fix:** Add guard before each lookup:
  ```js
  const cat = APP_DATA.categories.find(c => c.id === data.categoryId);
  if (!cat) { goBack(); return; }
  ```

---

### 🟡 Medium Priority

#### M1 — Duplicate menu toggle logic
- **File:** `js/app.js` lines ~291–307 (global pill) and ~309–324 (home auth bar)
- **Issue:** `toggleUserMenu()` and `toggleHomeUserMenu()` are near-identical — both find a menu by ID, check `.open`, close any open menu, then add `.open` + outside-click listener.
- **Fix:** Extract a shared utility:
  ```js
  function toggleMenu(menuId, e) {
    e.stopPropagation();
    const menu = document.getElementById(menuId);
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    document.querySelectorAll('.user-menu.open').forEach(m => m.classList.remove('open'));
    if (!isOpen) {
      menu.classList.add('open');
      setTimeout(() => document.addEventListener('click', () =>
        menu.classList.remove('open'), { once: true }), 0);
    }
  }
  ```

#### M2 — Preferences (PREFS object) not persisted
- **File:** `js/app.js` — `PREFS` object and `togglePref()` function
- **Issue:** Preference toggles (style, subject, level) are held in memory only. Reloading the page resets all preferences.
- **Fix:** Save on every toggle:
  ```js
  localStorage.setItem('da_prefs', JSON.stringify(PREFS));
  ```
  Restore in `checkAuth()`:
  ```js
  const storedPrefs = localStorage.getItem('da_prefs');
  if (storedPrefs) Object.assign(PREFS, JSON.parse(storedPrefs));
  ```

#### M3 — Hardcoded border-radius values not using CSS tokens
- **File:** `css/styles.css` lines ~1278 (`border-radius: 10px`), ~2014 (`border-radius: 8px` on scrubber)
- **Issue:** Post global 4px button rule, these overrides are correct *functionally* but don't use the design token system (`--r-md: 8px`, no token for 10px).
- **Fix:** Add `--r-interactive: 10px` token to `:root` for interactive controls (gen-action-btn, today-card buttons, etc.) and update references.

#### M4 — Inconsistent media query breakpoints
- **File:** `css/styles.css` — multiple `@media` blocks
- **Issue:** Breakpoints are defined at 641px, 678px, 768px, 1024px, **and 1025px** — the 1024/1025 split creates a 1px gap.
- **Fix:** Standardise to three breakpoints in `:root` comments and use consistently:
  - Mobile: `< 640px`
  - Tablet: `641px – 1023px`
  - Desktop: `≥ 1024px`
  Remove the `1025px` instance.

---

### 🟢 Low Priority

#### L1 — Redundant `border-radius: 4px` on button elements
- **File:** `css/styles.css` lines ~874 (`.nav-bar__back`), ~3509 (`.explore-filter-tag`), ~4013 (`.pref-tag`)
- **Issue:** Global `button { border-radius: 4px }` now covers these — the per-class declarations are redundant noise.
- **Fix:** Remove those three `border-radius: 4px` declarations.

#### L2 — `page-detail` and `page-article` are unreachable
- **File:** `js/app.js` — `renderExerciseDetail()` and `renderArticle()` defined but no navigation leads to them in normal flow
- **Issue:** These pages exist as scaffolding but are orphaned — no `navigateTo('page-detail', ...)` call is wired to any button.
- **Fix (next session):** Either wire exercise cards to go to detail before video, or remove scaffolding until needed.

#### L3 — Exercise row HTML duplicated in list vs. search
- **File:** `js/app.js` lines ~1601–1627 (exercise list) and ~2673–2686 (search results)
- **Issue:** Two nearly-identical HTML generation patterns for exercise rows.
- **Fix:** Extract to a shared `renderExerciseRow(ex, cat)` helper function.

---

### ✅ Verified Clean

- All changelog entries for 2026-03-07 are implemented correctly in code
- No missing function definitions or unclosed template literals
- No localStorage reads inside render loops
- `renderGlobalAvatar()` correctly called in both `bootAuthenticatedApp()` and `loadData()`
- Dark/light nav logic correctly gates on `!currentUser`
- For You like/bookmark state correctly restored from localStorage on `renderForYou()`
- Two-section Saved page working as described
- Authenticated dashboard (all 5 sections) present and functional
- Global `button { border-radius: 4px }` applied with correct circular overrides

---

### CSS / JS Version at Audit Time
| File | Version |
|------|---------|
| `css/styles.css` | v=84 |
| `js/app.js` | v=66 |

---
