# Testing

This project uses Vitest for unit tests and Playwright for E2E tests.

## Unit Tests (Vitest)

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with UI:
```bash
npm run test:ui
```

## E2E Tests (Playwright)

Run E2E tests:
```bash
npm run test:e2e
```

Run E2E tests with UI:
```bash
npm run test:e2e:ui
```

Note: E2E tests require the dev server to be running. Playwright will automatically start it if not already running.

## Test Structure

- Unit tests: `**/*.{test,spec}.{ts,tsx}` files alongside source code
- E2E tests: `playwright/*.spec.ts`

