## Quick start (Vite + React)
```bash
npm install
npm run start   # dev
npm run build   # production build
npm run preview # serve dist
npm run lint    # lint
```

### Environment variables
See `.env.example`. Create a `.env` file with your local values. All variables must be prefixed with `VITE_` to be exposed to the client.

### New additions (non-destructive)
- Theme toggle (dark/light) with persisted preference
- Route-level code splitting (faster first load)
- Centralized route meta (document title / description)
- `/404` page (kept wildcard redirect unchanged)
- Minor accessibility improvements (focus-visible, nav landmark)