# Snips — Agent Skills Guide

This file tells an AI agent everything it needs to know to work on this codebase correctly.

## Before writing any code

1. Read ARCHITECTURE.md — understand data flow and db patterns
2. Read FRONTEND.md — understand design system and UI rules
3. Check constants/theme.ts for correct colour and font values
4. Check constants/measurements.ts for field definitions
5. Check db/helpers.ts before writing any new db query

## Adding a new screen

1. Create file in correct app/(drawer)/ subfolder
2. Use .tsx extension
3. Import TopBar from @/components/TopBar
4. Wrap content in View with backgroundColor: Colors.brand.background
5. Add screen to drawer in app/(drawer)/_layout.tsx if it needs a drawer entry
6. Read from PreferencesContext for dark mode — adjust colours accordingly

## Adding a new db query

1. Write the SQL in db/helpers.ts — never inline SQL in a component
2. Use ? placeholders for all values — never interpolate user input
3. Table names and column names may be interpolated only if type-locked
4. Use getAllSync for SELECT many, getFirstSync for SELECT one, runSync for INSERT/UPDATE/DELETE
5. Return lastInsertRowId from runSync when creating a new record
6. Always pass array as second argument to runSync/getAllSync/getFirstSync

## Styling rules

- Never hardcode colour hex values in components
- Never hardcode font name strings in components
- Never use string values for numeric style props (borderWidth, padding, etc.)
- No input borders anywhere — ghost input pattern only
- Always use StyleSheet.create() — no inline style objects except for dynamic values
- Use Spacing.* for all padding/margin/gap values
- Use Radius.* for all borderRadius values
- Use Colors.* for all colour values
- Use Fonts.* for all fontFamily values

## Measurement forms

- Never hardcode measurement field names
- Always drive the form from femaleMeasurements or maleMeasurements array
- Determine which array to use from customer.gender
- Render via .map() with field.key as the key prop
- Custom fields come from JSON.parse(measurement.custom_fields)
- Display order: filled fields → blank fields → custom fields

## Status values

Valid cloth status values (lowercase, stored as TEXT in SQLite):
- 'cut'
- 'sewn'  
- 'ready'

Overdue is not a status — it is derived at render time:
- if due_date < today AND status !== 'ready' → show overdue indicator

Always use StatusPill component to render status — never inline.

## Canvas editing pattern

For any tap-to-edit field:
- Use TextInput with no border styles
- placeholder="—" for empty fields
- onSubmitEditing to move focus to next field ref
- returnKeyType="next" for middle fields, "done" for last field
- Save to db onBlur — not on every keystroke

## FAB behaviour

- FAB must be hidden when any overlay/sheet/flow is open
- Use a global isFABVisible state in a FABContext or pass via prop
- FAB position: absolute, bottom: 20, left: 20
- Always trigger Haptics.impactAsync on FAB expand

## AsyncStorage keys
snips_gender_mode
snips_dark_mode
snips_measurement_unit
snips_tailor_name
snips_shop_name
snips_tailor_phone
onboarding_done

Never create new AsyncStorage keys without adding them here.

## Common mistakes to avoid

- Passing boolean directly to SQLite — use 0/1
- Using runSync for SELECT queries
- Using getAllSync for single-row queries
- Forgetting PRAGMA foreign_keys = ON
- Hardcoding '#E43636' instead of Colors.brand.primary
- String style values like borderWidth: '0.5' instead of 0.5
- Importing GenderMode as a value instead of a type
- Using router.push() from onboarding instead of router.replace()
- Creating AsyncStorage keys not listed above
- Interpolating user input directly into SQL strings