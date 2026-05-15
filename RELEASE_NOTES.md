# MatEdge — Release Notes

---

## v0.1.0 — Initial Scaffold
**Status:** Complete

### Features Delivered
- **Athlete Profile** — capture name, weight, height, age, body fat %, wrestling style, target weight class, training base, and notes
- **Live Quick Stats** — BMI, estimated BMR, and pounds to cut calculated in real time as profile is filled in
- **Weight Class Selector** — organized by division with full coverage:
  - Junior High / Middle School (75–275 lbs in standard increments)
  - High School (106–285 lbs)
  - NCAA Folkstyle (125–285 lbs)
  - Freestyle / Greco-Roman (57kg–125kg converted to lbs)
  - Custom weight class entry for non-standard divisions
- **Weekly Training Schedule** — set session type per day (Rest, Light Practice, Heavy Practice, Drilling, Live Wrestling, S&C, Cardio, Recovery/Film) with auto-labeled intensity (Rest / Low / Med / High)
- **Competition Schedule** — add unlimited competitions with event name, date, target weight, and priority tier (A = Peak, B = Tune-up, C = Open). Days-out countdown with color-coded urgency
- **Daily Plan** — auto-calculated from profile + training day + competition schedule:
  - Caloric target (TDEE adjusted for training intensity and cut pace)
  - Macro breakdown with visual bar chart (protein / carbs / fats)
  - Hydration guide with timing windows
  - Supplement stack with training-day-aware activation (Creatine, Whey, Electrolytes, Magnesium, Vitamin D3/K2, Omega-3)
- **Data persistence** — all data saved to localStorage, survives page reloads and app restarts

---

## v0.2.0 — PWA & Mobile Support
**Status:** Complete

### Features Delivered
- **Progressive Web App (PWA)** — fully installable on all platforms:
  - Android: install prompt banner + Chrome menu
  - iPhone/iPad: Safari "Add to Home Screen"
  - Windows/macOS: Chrome/Edge install button
- **App manifest** — name, icons, theme color, display mode, orientation
- **Service worker** — offline caching with network-first strategy for HTML (ensures updates are always picked up) and cache-first for static assets
- **8 app icons** — generated at all required sizes (72, 96, 128, 144, 152, 192, 384, 512px)
- **Offline indicator** — red bar displayed when device loses internet connection
- **iOS optimizations** — safe area insets for notch devices, 16px font size on inputs to prevent auto-zoom, `-webkit-tap-highlight-color` removed, `-webkit-overflow-scrolling: touch`
- **Scroll fix** — rubber band / bounce scroll effect on iOS eliminated via `position: fixed` on html/body with overflow on app container
- **Local dev server** (`server.js`) — zero-dependency Node.js server with network IP display for phone testing
- **Auto-cache versioning** — bumping `CACHE_VERSION` in `sw.js` clears old caches on next load

---

## v0.3.0 — Branding & UI Polish
**Status:** Complete

### Features Delivered
- **Rebranded to MatEdge** — all references updated across index.html, manifest.json, server.js, sw.js, README.md, icons
- **Logo display fix** — removed `text-transform: uppercase` so "MatEdge" renders in proper mixed case
- **Tagline updated** — "Support for Elite Wrestlers"
- **Competition card layout** — fixed date/target weight field overlap on mobile using full vertical stacking
- **Date input fix** — `-webkit-appearance: none` applied to force iOS date input to respect container width
- **4-digit calorie overflow fix** — stat cards use `min-width: 0`, `white-space: nowrap`, reduced padding so 4-digit numbers stay contained

---

## v0.4.0 — Nutrition & Food Recommendations
**Status:** Complete

### Features Delivered
- **Nutrition tab** — food recommendations organized by meal type, auto-scaled to daily calorie target:
  - Breakfast options (~30% of daily calories) — 6 options
  - Lunch options (~30%) — 6 options
  - Dinner options (~30%) — 6 options
  - Snack options (~10%) — 8 options
- Portions and macros scale dynamically based on athlete's calculated calorie target for the day
- Each meal card shows calories, protein, carbs, and fat
- Meal-type tips (timing guidance) displayed per section

---

## v0.5.0 — Calorie Calculator
**Status:** Complete

### Features Delivered
- **Cal Calc tab** — search-based food logging tool
- **Built-in food database** — 55 athlete-focused foods covering proteins, carbs, vegetables, fats, dairy, snacks, and recovery items with USDA-standard per-100g values
- **USDA FoodData Central proxy** — server.js proxies requests to the USDA API (600,000+ foods) to avoid CORS issues; built-in database serves as offline fallback
- **Portion calculator** — adjust by grams, oz, or servings with live-updating macro display
- **Add to log** — one-tap logging with visual confirmation
- **Today's food log** — running total with goal vs. actual comparison, full macro breakdown per item, individual item removal
- **Date-stamped history** — each day's log stored separately under its own date key in localStorage

---

## v0.6.0 — Progress Tracker
**Status:** Complete

### Features Delivered
- **Progress tab** — full competition prep tracking dashboard
- **14-day calorie history** — horizontal bar chart for every day with color coding:
  - Green = under target (on track for cut)
  - Gold = within 10% of target
  - Red = over target
  - Gold vertical line marking daily target on each bar
- **Delta column** — shows exact difference vs. target per day (+/-)
- **Competition countdown cards** — one card per upcoming competition showing:
  - Days out (color coded: red < 7 days, gold < 21 days)
  - Pounds still to cut
  - Required lbs/day to make weight
  - 7-day average calorie intake
- **Weekly summary** — this week vs. last week comparison:
  - Total calories logged
  - Average daily intake
  - Average vs. target
  - Days on target (within ±10%)

---

## Infrastructure
**Status:** Complete (local)

- Node.js local server with static file serving and food search API proxy
- PWA service worker with versioned cache management
- localStorage-based persistence for profile, schedule, competitions, food log history
- README.md with setup instructions and Capacitor deployment guide
- Git repository initialized and pushed to GitHub (github.com/rbrown2007/matedge)

---

