# Repository Guidelines

## Project Structure & Module Organization
`app/` contains Expo Router screens and route groups such as `app/(drawer)/`. Shared UI lives in `components/`, reusable hooks in `hooks/`, app-wide state in `context/`, and design tokens in `constants/`. SQLite setup and schema SQL live in `db/`. Static assets such as fonts and icons belong in `assets/`. Utility scripts go in `scripts/`.

## Build, Test, and Development Commands
Run `bun install` if dependencies are missing. Use `bun run start` to launch the Expo dev server, `bun run android` or `bun run ios` for device targets, and `bun run web` for browser testing. Run `bun run lint` before opening a PR; it executes Expo’s ESLint setup. `bun run reset-project` resets the starter state and should only be used intentionally.

## Coding Style & Naming Conventions
This project uses TypeScript with `strict` mode enabled and the `@/*` path alias from [tsconfig.json](/abs/path/C:/Users/aracnid/Documents/js-projects/snips/tsconfig.json). Follow the existing codebase style: functional React components, single quotes, and semicolon-free statements. Prefer PascalCase for components (`TopBar.tsx`, `PreferencesProvider`), camelCase for variables/functions, and UPPER_SNAKE_CASE for exported SQL constants in `db/schemas.ts`. Keep route file names aligned with Expo Router conventions, including dynamic segments like `customers/[id].tsx`.

## Testing Guidelines
There is no automated test suite yet. For now, treat `bun run lint` as the minimum quality gate and manually verify affected flows in Expo Go or a simulator. When adding tests later, place them beside the feature or in a local `__tests__/` folder and use `*.test.ts` or `*.test.tsx` naming.

## Commit & Pull Request Guidelines
Recent history uses short imperative prefixes such as `Add: ...`, `Init: ...`, and `Wip: ...`. Keep commit subjects concise, capitalized, and focused on one change. Pull requests should include a brief summary, the screens or modules touched, manual test notes, and screenshots or recordings for UI changes. Link any related issue or task, especially when changing navigation, onboarding, or database schema behavior.

## Configuration & Data Notes
Do not commit secrets or local device artifacts. Treat `.expo/` as generated state, and review schema edits carefully because changes in `db/` affect offline user data and onboarding flows.
