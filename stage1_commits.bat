@echo off
REM ==============================================================================
REM CampusBite Stage 1 — 20 Granular Commits Script
REM Run this script from the repository root: .\stage1_commits.bat
REM ==============================================================================

echo [1/20] Commit 1: Test runner null-safety and Database decoupling...
git add app.js tests/campusbite_tests.js
git commit -m "fix(tests): decouple Database instantiation and add null checks for headless runner"

echo [2/20] Commit 2: Architecture specification...
git add docs/architecture.md
git commit -m "docs(architecture): add comprehensive architecture specification for Stage 1"

echo [3/20] Commit 3: Migration plan and parity matrix...
git add docs/migration-plan.md
git commit -m "docs(migration): establish feature parity tracking matrix and migration roadmap"

echo [4/20] Commit 4: Testing runbook...
git add docs/testing.md
git commit -m "docs(testing): add runbook for web frontend, legacy tests, and JavaFX verification"

echo [5/20] Commit 5: Frontend CI workflow...
git add .github/workflows/ci.yml
git commit -m "ci(github): add dedicated frontend CI verification workflow for web directory"

echo [6/20] Commit 6: Web package manifest...
git add web/package.json
git commit -m "chore(web): initialize package manifest with React 18, Vite 5, and TypeScript 5"

echo [7/20] Commit 7: TypeScript configuration...
git add web/tsconfig.json web/tsconfig.node.json
git commit -m "chore(web): configure strict TypeScript settings and project references"

echo [8/20] Commit 8: Vite bundler and Vitest configuration...
git add web/vite.config.ts
git commit -m "chore(web): configure Vite bundler and Vitest jsdom test runner"

echo [9/20] Commit 9: ESLint configuration...
git add web/.eslintrc.cjs
git commit -m "chore(web): configure ESLint rules for TypeScript and React hooks"

echo [10/20] Commit 10: Environment variables template...
git add web/.env.example
git commit -m "chore(web): add safe environment variables template with placeholder keys"

echo [11/20] Commit 11: Design tokens...
git add web/src/styles/tokens.css
git commit -m "style(web): define design tokens for editorial color palette and typography"

echo [12/20] Commit 12: Global stylesheet and resets...
git add web/src/styles/global.css
git commit -m "style(web): define global CSS resets, typography hierarchy, and layout utilities"

echo [13/20] Commit 13: TypeScript domain models...
git add web/src/lib/types.ts
git commit -m "feat(web): define strict TypeScript domain interfaces for orders and menu"

echo [14/20] Commit 14: Typed Supabase client factory...
git add web/src/lib/supabase.ts
git commit -m "feat(web): implement typed, fail-safe Supabase client factory"

echo [15/20] Commit 15: UI primitives (Button, StatusPill, Toast)...
git add web/src/components/ui/Button.tsx web/src/components/ui/StatusPill.tsx web/src/components/ui/Toast.tsx
git commit -m "feat(web): add reusable UI primitives for buttons, status badges, and toasts"

echo [16/20] Commit 16: Feedback components (ErrorBoundary, Loading, EmptyState)...
git add web/src/components/feedback/ErrorBoundary.tsx web/src/components/feedback/LoadingState.tsx web/src/components/feedback/EmptyState.tsx
git commit -m "feat(web): add error boundary, loading spinner, and empty state feedback components"

echo [17/20] Commit 17: Layout components (Header with lang toggle, Footer)...
git add web/src/components/layout/Header.tsx web/src/components/layout/Footer.tsx
git commit -m "feat(web): implement shared layout header with language selector and footer"

echo [18/20] Commit 18: BREAK-FIT, LAST PLATE, and MenuGrid feature views...
git add web/src/features/break-fit/BreakFitFilter.tsx web/src/features/last-plate/LastPlateSection.tsx web/src/features/menu/MenuGrid.tsx
git commit -m "feat(web): create BREAK-FIT filter, LAST PLATE surplus rescue, and MenuGrid views"

echo [19/20] Commit 19: Kitchen Operations Kanban board...
git add web/src/features/kitchen/KanbanBoard.tsx
git commit -m "feat(web): implement Kitchen Operations Kanban board with order status advancement"

echo [20/20] Commit 20: Application shell, routing, DOM entry point, and test suite...
git add web/index.html web/src/main.tsx web/src/app/App.tsx web/src/app/providers.tsx web/src/app/routes.tsx web/src/test/setup.ts web/src/test/app.test.tsx
git commit -m "feat(web): assemble application shell, routing, DOM entry point, and component tests"

echo ==============================================================================
echo All 20 commits have been created successfully!
echo Run 'git status' and 'git log -n 20 --oneline' to review before pushing.
echo Then run: git push
echo ==============================================================================
