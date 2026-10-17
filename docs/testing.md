# CampusBite Testing & Verification Guide

This guide details how to verify the new React + TypeScript + Vite frontend under `web/`, the legacy browser regression suite, and the JavaFX desktop application.

---

## 1. Quick Reference: Command Matrix

| Target | Command | Working Directory | Purpose |
| :--- | :--- | :--- | :--- |
| **Install Dependencies** | `npm ci` or `npm install` | `web/` | Install frozen, verified npm packages |
| **Type Check** | `npm run type-check` | `web/` | Execute strict TypeScript compiler verification (`tsc --noEmit`) |
| **Lint** | `npm run lint` | `web/` | Run ESLint for React hooks and TypeScript conventions |
| **Component & Unit Tests** | `npm run test` | `web/` | Run Vitest in single-run mode (`vitest run`) |
| **Component Tests (Watch)** | `npm run test:watch` | `web/` | Run Vitest in interactive watch mode |
| **Production Build** | `npm run build` | `web/` | Build production bundle to `web/dist/` (`tsc && vite build`) |
| **Local Dev Server** | `npm run dev` | `web/` | Start local Vite hot-reloading development server |
| **Legacy Browser Suite** | Open `tests.html` in browser | `.` (Repo Root) | Run 26 browser regression test assertions |
| **JavaFX Desktop App** | `mvn test` or `mvn compile` | `.` (Repo Root) | Compile and verify JavaFX application classes |

---

## 2. Web Frontend (`web/`) Verification

All commands in this section must be executed from the `web/` directory:

```bash
cd web
```

### 2.1 Dependency Installation
```bash
npm install
```
Installs React 18, TypeScript 5, Vite 5, Vitest, Testing Library, and ESLint without modifying root project files.

### 2.2 Strict TypeScript Verification
```bash
npm run type-check
```
Executes `tsc --noEmit` against `tsconfig.json`. Verifies:
- No implicit any
- Strict null checks
- Exact optional property types
- Consistent module resolution via `@/*` aliases

### 2.3 Linting
```bash
npm run lint
```
Executes ESLint across `src/` validating React hooks rules, unused variables, and JSX formatting.

### 2.4 Unit & Component Testing
```bash
npm run test
```
Executes Vitest tests in `web/src/test/`. Tests cover:
- Application shell rendering
- Brand header, typography, and responsive container layout
- Portal switching between Student Canteen and Kitchen Operations
- BREAK-FIT™ class-interval duration filtering
- Cart addition and toast notification feedback
- Error boundary and fallback UI

### 2.5 Production Build
```bash
npm run build
```
Generates an optimized, tree-shaken static production bundle in `web/dist/`.
*Note: As per Condition A, `web/dist/` is NOT deployed to GitHub Pages during Stage 1.*

---

## 3. Legacy Browser Regression Test Suite (`tests.html`)

The original application includes 26 regression test assertions in `tests.html` covering the in-browser database engine, idempotency, batching, inventory, and LAST PLATE reservations.

### How to Run:
1. Open `tests.html` directly in any modern browser (or serve via a local static HTTP server).
2. The automated runner executes on page load.
3. Verification results:
   - **Total Tests**: 26
   - **Passed**: 26
   - **Failed**: 0
   - **Duration**: ~20ms

### Automated Headless Execution:
For headless CI environments:
```bash
npx playwright test tests/e2e/legacy-baseline.spec.ts
```
*(Or inspect DOM node `#summary` on `tests.html` for `text: "26 / 26 passed"`)*.

---

## 4. JavaFX Desktop Application Verification

The JavaFX desktop project is located at the root of the repository and governed by `pom.xml`.

### Verification Command:
```bash
mvn clean test-compile
```
Or to run JavaFX unit tests:
```bash
mvn test
```

### Environment Prerequisites:
- Java Development Kit (JDK) 17 or higher
- Apache Maven 3.8+
- JavaFX 17 runtime dependencies (configured in `pom.xml`)

*Note: If Maven or Java is not installed in the local environment, the JavaFX source code (`src/main/java`) remains intact, clean, and isolated.*

---

## 5. Continuous Integration (GitHub Actions)

Frontend verification is codified in `.github/workflows/ci.yml`. It runs on every push and pull request targeting `main`:
1. Checkout code
2. Setup Node.js 20
3. `npm ci` in `web/`
4. `npm run type-check`
5. `npm run lint`
6. `npm run test`
7. `npm run build`

The CI pipeline strictly gates changes to `web/` while leaving `.github/workflows/deploy.yml` intact.
