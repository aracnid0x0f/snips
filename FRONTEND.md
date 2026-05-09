# Snips — Frontend Guide

## Stack
- React Native via Expo (SDK 54)
- Expo Router (file-based routing)
- TypeScript
- StyleSheet API (no styled-components, no Tailwind)

## Folder Structure
app/
_layout.tsx                  # Root layout — fonts, db init, preferences, splash
onboarding.tsx               # First launch only
(drawer)/
_layout.tsx                # Drawer navigator (right-side)
index.tsx                  # Queue screen (home)
settings.tsx               # Tailor profile + app preferences
customers/
index.tsx                # Customer list
[id].tsx                 # Customer profile (canvas)
collections/
index.tsx                # Collection list
[id].tsx                 # Collection detail
cloth/
[id].tsx                 # Cloth detail (canvas)
components/
TopBar.tsx                   # Persistent top bar — logo, search, hamburger
FAB.tsx                      # Global floating action button
SearchOverlay.tsx            # Fullscreen search with blur backdrop
StatusPill.tsx               # CUT / SEWN / READY / OVERDUE pill
MeasurementField.tsx         # Single tap-to-edit measurement row
constants/
theme.ts                     # All colours, fonts, spacing, radius
measurements.ts              # Male/female field definitions
context/
PreferencesContext.tsx       # Global tailor preferences + profile
db/
schema.ts                    # SQL CREATE TABLE statements
helpers.ts                   # All db query functions

## Design System

### Colours
```ts
Colors.brand.primary      #E43636   FAB, buttons, primary actions
Colors.brand.background   #F6EFD2   Page background, canvas surface
Colors.brand.border       #E2DDB4   Dividers, input backgrounds, muted pills
Colors.brand.text         #000000   All text, logo

Colors.status.cut         { bg: '#FDE68A', text: '#92400E' }
Colors.status.sewn        { bg: '#BFDBFE', text: '#1E40AF' }
Colors.status.ready       { bg: '#BBF7D0', text: '#166534' }
Colors.status.overdue     { bg: '#FECDD3', text: '#9F1239' }

Colors.dark.background    #1A1A1A
Colors.dark.surface       #2A2A2A
Colors.dark.border        #3A3A3A
Colors.dark.text          #F6EFD2
```

### Typography
```ts
Fonts.display   'BorderWall'           // headings, logo, screen titles
Fonts.body      'CaveatBrush_400Regular' // all body text, labels, inputs
```
Border Wall is a custom .otf font loaded via expo-font.
Caveat Brush Light is loaded via @expo-google-fonts/caveat.

### Spacing Scale
```ts
Spacing.xs   4
Spacing.sm   8
Spacing.md   12
Spacing.lg   16
Spacing.xl   24
Spacing.xxl  32
```

### Border Radius
```ts
Radius.sm    8
Radius.md    12
Radius.lg    16
Radius.full  999
```

## Key UI Patterns

### Canvas-style editing
Every value on Customer Profile and Cloth Detail is a ghost input.
- Looks like plain text when idle
- No border, no outline — ever
- Tapping activates it inline
- ENTER moves focus to the next field (via ref chain)
- Saving is automatic on blur or ENTER

### FAB (Floating Action Button)
- Position: bottom left, absolute
- Expands upward on tap — Google Keep style
- 4 options: Cloth, Measurement, Customer, Collection
- FAB hides completely when any flow/overlay is open
- Haptic feedback on expand
- Returns when overlay is dismissed

### Search overlay
- Search bar lives in TopBar on every screen
- Tap → expands fullscreen, backdrop blurs
- Live results as user types
- Searches: customer names, cloth titles, collection names
- Tap outside or X → dismisses

### Status pills
Always use the StatusPill component — never hardcode status colours inline.

### Measurement form
- Fields rendered from femaleMeasurements or maleMeasurements array via .map()
- Filled fields shown first, blank fields below, custom fields at bottom
- Each field is a MeasurementField component

## Navigation
- Right-side drawer via @react-navigation/drawer
- drawerPosition: 'right'
- Drawer items: Queue, Customers, Collections, Settings (bottom)
- Wrap root in GestureHandlerRootView

## Dark Mode
- Supported from day one
- Controlled via isDarkMode in PreferencesContext
- Every component reads from context — never hardcode light-only colours

## Haptics
Use expo-haptics for:
- FAB expand/collapse
- Checkbox tick (collection member collected)
- Status change on cloth
- Success actions (save, create)

## Rules
- Never hardcode colours — always use Colors.*
- Never hardcode font names — always use Fonts.*
- Never use px string values in StyleSheet — numbers only
- No input borders anywhere in the app
- All numeric style props must be numbers, never strings
- Use Spacing.* and Radius.* for consistency