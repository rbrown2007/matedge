# MatEdge — Product Backlog

Priority tiers: **P0** = must-have before launch | **P1** = high value, ship soon | **P2** = important, next sprint | **P3** = future / nice-to-have

---

## 🔴 P0 — Required Before Public Web Launch

### Authentication & User Accounts
- [ ] User registration (email + password)
- [ ] User login / logout
- [ ] "Sign in with Google" OAuth
- [ ] "Sign in with Apple" OAuth (required for App Store)
- [ ] Password reset via email
- [ ] Session management (JWT tokens or sessions)
- [ ] Protect all data routes behind authentication

### Cloud Database
- [ ] Migrate all localStorage data to server-side database (Firebase Firestore or Supabase)
- [ ] User profile stored and synced to cloud
- [ ] Training schedule stored per user
- [ ] Competition schedule stored per user
- [ ] Food log history stored per user (date-stamped)
- [ ] Data loads on login from any device
- [ ] Offline queue — changes made offline sync when connection restores

### Hosting & Deployment
- [ ] Deploy to Railway (or Render)
- [ ] Set USDA_API_KEY as environment variable on Railway
- [ ] Custom domain setup (e.g. matedge.com or app.matedge.com)
- [ ] HTTPS enforcement
- [ ] Environment config (.env file for local, env vars for production)

### Security
- [ ] Input sanitization on all form fields
- [ ] Rate limiting on API endpoints
- [ ] CORS locked to your domain in production
- [ ] API keys never exposed to the client

---

## 🟠 P1 — High Value, Ship Shortly After Launch

### Daily Weigh-In Log
- [ ] Daily weight entry field (with date)
- [ ] Weight history chart (14-day and 30-day views)
- [ ] Weight trend line overlaid on calorie history in Progress tab
- [ ] Alert if weight loss pace is too aggressive (> 1.5% body weight/week)
- [ ] Alert if weight loss is off track for upcoming competition

### Calorie Calculator Improvements
- [ ] Expand built-in food database (target 300+ items)
- [ ] Add common meals as searchable entries (not just ingredients)
- [ ] Recent foods list (last 10 logged items for quick re-logging)
- [ ] Favorite foods (pin frequently used items)
- [ ] Custom food entry (add a food manually with your own macros)
- [ ] Barcode scanner (mobile camera scan to look up packaged foods)

### Competition Prep Improvements
- [ ] Week-by-week cut plan — auto-generated calorie targets from now to weigh-in
- [ ] Water cut protocol for final 24–48 hours (sodium/water manipulation guide)
- [ ] Rehydration plan post-weigh-in
- [ ] Email/push notification reminders leading into competition

### UX & Navigation
- [ ] Bottom tab navigation for mobile (replace top nav tabs)
- [ ] Swipe between tabs on mobile
- [ ] Dark/light mode toggle
- [ ] Onboarding flow for new users (guided profile setup)
- [ ] Empty state improvements with helpful prompts

---

## 🟡 P2 — Important, Next Major Sprint

### Coach / Multi-Athlete Mode
- [ ] Coach account type
- [ ] Athlete invite system (coach sends link, athlete joins roster)
- [ ] Coach dashboard — see all athletes' current weight, target, days to comp
- [ ] Coach can view (but not edit) athlete profiles and progress
- [ ] Messaging between coach and athlete within app
- [ ] Team roster management

### Nutrition Intelligence
- [ ] Dietary restriction filters (gluten-free, dairy-free, halal, kosher, vegetarian, vegan)
- [ ] Meal recommendations adjust to dietary restrictions set in profile
- [ ] Macro calculator for custom meal planning
- [ ] Meal prep mode — scale recipes to batch cook for the week
- [ ] Integration with MyFitnessPal or Cronometer for food import

### Progress & Analytics
- [ ] 30-day and 90-day progress views
- [ ] Body fat % tracking (if entered)
- [ ] Lean mass vs. fat mass change estimate over time
- [ ] Exportable progress report (PDF) to share with coach or dietitian
- [ ] Competition history — past events with performance notes

### Supplement Tracker
- [ ] Custom supplement stack (add/remove/edit supplements)
- [ ] Daily supplement checklist with completion tracking
- [ ] Supplement reminder notifications

---

## 🔵 P3 — Future / Nice-to-Have

### App Store Preparation
- [ ] Capacitor setup for iOS build
- [ ] Xcode project configuration and code signing
- [ ] Apple Developer account enrollment ($99/year)
- [ ] App Store listing — screenshots, description, keywords
- [ ] App Store review submission
- [ ] Capacitor setup for Android build
- [ ] Android Studio project configuration
- [ ] Google Play Developer account ($25 one-time)
- [ ] Google Play listing — screenshots, description
- [ ] Google Play review submission
- [ ] Push notifications via Capacitor (iOS + Android)
- [ ] Native camera access for barcode scanning (Capacitor plugin)

### Platform Expansion
- [ ] Electron wrapper for Windows desktop app
- [ ] Tauri wrapper for macOS desktop app (lighter than Electron)
- [ ] Apple Watch companion app (weigh-in logging from wrist)

### Advanced Features
- [ ] AI-powered meal planning (generate a full week of meals hitting targets)
- [ ] AI cut strategy advisor (analyze history, suggest adjustments)
- [ ] Video library — technique tips for weight management (weight cutting, hydration)
- [ ] Community features — connect with other wrestlers, share tips
- [ ] In-app purchases / subscription model for premium features
- [ ] White-label version for wrestling programs and universities

### Integrations
- [ ] Apple Health / Google Fit sync (pull weight and activity data automatically)
- [ ] Garmin / Fitbit / WHOOP integration (pull training load data)
- [ ] Cronometer or MyFitnessPal import
- [ ] Calendar sync (competition dates → Google/Apple Calendar)

---

## 🏗 Technical Debt & Infrastructure

- [ ] Migrate from single HTML file to proper build system (Vite + React)
- [ ] TypeScript for type safety
- [ ] Unit tests for calculation functions (BMR, TDEE, cut pace)
- [ ] End-to-end tests (Playwright or Cypress)
- [ ] CI/CD pipeline (GitHub Actions → auto-deploy to Railway on push to main)
- [ ] Error logging (Sentry)
- [ ] Analytics (privacy-respecting, e.g. Plausible or Fathom)
- [ ] Performance monitoring
- [ ] Database backups (automated daily)
- [ ] GDPR / data privacy compliance (terms of service, privacy policy, data deletion)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)

---

## 📋 Definition of "Ready for Web Launch" (P0 Complete)

The app is considered ready for public web use when:

1. ✅ Users can create an account and log in
2. ✅ All data is stored in the cloud and accessible from any device
3. ✅ App is deployed to a public URL with HTTPS
4. ✅ USDA food search is working in production
5. ✅ No sensitive keys or credentials are exposed client-side
6. ✅ Basic security hardening is in place (rate limiting, input sanitization)

---

## 📋 Definition of "Ready for App Store" (P0 + P3 App Store items)

In addition to web launch requirements:

1. ✅ Capacitor configured for iOS and Android
2. ✅ Apple Developer account active ($99/year)
3. ✅ Google Play Developer account active ($25 one-time)
4. ✅ "Sign in with Apple" implemented (required by Apple for apps with social login)
5. ✅ App Store screenshots and listing prepared
6. ✅ App passes Apple review guidelines (no misleading health claims)
7. ✅ Privacy policy URL provided to both stores

---

*Last updated: v0.6.0*
*Maintained by: MatEdge Development*

