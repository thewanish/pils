## Copilot instructions for this repo

Purpose: Help AI coding agents become productive quickly in this React Native (Expo) + TypeScript app.

- **Project type**: Expo React Native app (see `app.json`, `eas.json`). Start with `npm install` then `npx expo start`.
- **Entry points**: app root is `App.tsx` or `src/RootApp.tsx` which mounts the Redux `Provider` and `NavigationContainer`.

Key architecture:
- UI: `src/Component/` (reusable UI pieces) and `src/Screens/` (screen-level containers).
- Navigation: `src/Navigation/RootStack.tsx` + `src/Navigation/MainTabs.tsx`. Routes are typed via `RootStackParamList`.
- State: Redux Toolkit slice at `src/Redux/BeerSlice.ts` and store at `src/Redux/store.ts`. Types for `Beer` and `BeerState` are defined in the slice.
- Data: remote beer dataset fetched in `src/utils/BeerApi.ts` (uses `axios`). App maps raw API fields into `Beer` shape expected by the slice.
- Backend/integration: Firebase initialized at `src/firebase/firebase.ts` (`auth`, `db`). Expo notifications are present (`expo-notifications`).

Conventions and gotchas (use these exactly):
- Route names in `RootStack` must match the keys of `RootStackParamList`. Example: the Beer screen is registered with the name `"Beer"` (not `BeerScreen`). See [src/Navigation/RootStack.tsx](src/Navigation/RootStack.tsx).
- State updates use Immer-style mutation via Redux Toolkit `createSlice`. Update fields directly on `state` inside reducers (see `toggleSaveBeer` pattern).
- `Beer` items are identified by numeric `id` created in `src/utils/BeerApi.ts` (index-based). When adding persistent IDs, update mapping code accordingly.
- Shared types live in slices (e.g., `Beer` type in `src/Redux/BeerSlice.ts`). Prefer importing types from slices instead of re-defining them.

Developer workflows / common commands:
- Install: `npm install`
- Start Metro / Expo dev server: `npx expo start` (or `npm run start`).
- Run Android/iOS: `npm run android` / `npm run ios` (they call `expo start --android|--ios`).
- Linting/tests: none configured in repo — keep changes small and test in Expo client or emulator.

Examples (how to change common things):
- Add a new screen route:
  1. Create `src/Screens/MyScreen.tsx`.
  2. Add type to `RootStackParamList` in `src/Navigation/RootStack.tsx`.
  3. Register in `RootStack` with the same name key.

- Fetch and store beers (typical flow):
  - Call `fetchBeers()` from `src/utils/BeerApi.ts`.
  - Dispatch `setBeers()` from `src/Redux/BeerSlice.ts` to populate state.

Files to inspect for context (quick scan):
- `App.tsx`, `src/RootApp.tsx` — app root and provider wiring.
- `src/Navigation/RootStack.tsx`, `src/Navigation/MainTabs.tsx` — navigation structure.
- `src/Redux/BeerSlice.ts`, `src/Redux/store.ts` — state shapes and reducers.
- `src/utils/BeerApi.ts` — remote data mapping.
- `src/firebase/firebase.ts` — Firebase initialization and exported `auth`/`db`.

When editing, run the app locally in Expo to validate UI and navigation changes.

If anything here is wrong or you'd like examples added (e.g., how to add tests, CI scripts, or TypeScript rules), tell me which area to expand.
