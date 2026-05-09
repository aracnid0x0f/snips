# Snips — Architecture Guide

## Overview
Snips is a local-first mobile app. All data lives on the device in SQLite.
No backend, no auth, no network calls in v1.

## Data Flow
User action
→ Component calls db helper function
→ Helper runs SQLite query via expo-sqlite
→ Returns result
→ Component updates local state
→ UI re-renders

Global preferences (gender mode, dark mode, tailor profile) flow via React Context — not SQLite. They are persisted via AsyncStorage.

## Database
- Engine: SQLite via expo-sqlite (openDatabaseSync)
- File: snips.db (created automatically on first launch)
- Init: initDatabase() called once in app/_layout.tsx on mount
- Foreign keys: PRAGMA foreign_keys = ON — must run on every connection

### Tables
customers
female_measurements     (1:1 with customers, gender = female)
male_measurements       (1:1 with customers, gender = male)
cloths                  (1:M with customers)
collections
collection_members      (junction — customers M:M collections)

### Key decisions
- Measurement tables are split by gender — not one table with nullable columns
- Cloth stores measurement_snapshot as JSON TEXT — snapshot at creation time
- Custom measurement fields stored as JSON TEXT in custom_fields column
- collected in collection_members is INTEGER (0/1) — SQLite has no boolean
- All dates stored as TEXT in ISO format (datetime('now'))
- ON DELETE CASCADE on all child tables — deleting a customer cleans everything

## State Management

### Local component state (useState)
- Form inputs
- UI toggles (collapsed/expanded, selected option)
- Loading states

### React Context (PreferencesContext)
- genderMode: 'female' | 'male' | 'both'
- isDarkMode: boolean
- measurementUnit: 'inches' | 'cm'
- tailorName, shopName, tailorPhone: string
- Persisted via AsyncStorage
- Loaded once on app mount via Promise.all

### No global state library
Redux, Zustand, Jotai — none needed. SQLite + Context covers all cases.

## File naming conventions
- Screens: PascalCase filenames, default export
- Components: PascalCase filenames, default export
- Helpers/constants: camelCase functions, named exports
- Types: PascalCase, exported from their source file
- DB helpers: verb-first (createCustomer, getClothById, updateCloth)

## TypeScript conventions
- .ts for pure logic (no JSX)
- .tsx for anything with JSX
- Import types with `import type { X }` syntax
- Union types for constrained string values (GenderMode, MeasurementUnit)
- Never use `any`
- Table names passed as union types — never raw strings

## Routing
Expo Router (file-based). Key routes:
/onboarding              → first launch only
/(drawer)                → home (Queue)
/(drawer)/customers      → customer list
/(drawer)/customers/[id] → customer profile
/(drawer)/collections    → collection list
/(drawer)/collections/[id] → collection detail
/(drawer)/cloth/[id]     → cloth detail
/(drawer)/settings       → tailor profile + preferences

Navigation rules:
- router.replace() from onboarding → never go back
- router.push() for all other navigation
- useLocalSearchParams() to read [id] params

## Startup sequence

SplashScreen.preventAutoHideAsync()
useFonts() loads BorderWall + CaveatBrush
initDatabase() creates tables if not exist
AsyncStorage loads onboarding_done flag
AsyncStorage loads all preferences via Promise.all
Both fonts and db ready → SplashScreen.hideAsync()
If onboarding_done → (drawer), else → onboarding


## Future — Cloud Sync (Premium)
- SQLite stays as local source of truth
- Sync layer sits on top — candidates: PowerSync, Supabase Realtime
- Each table needs a server_id and synced_at column added via migration
- PRAGMA user_version used for schema versioning/migrations