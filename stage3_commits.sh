#!/usr/bin/env bash
# ==============================================================================
# CampusBite Stage 3 — Ordering Engine, Kitchen Operations & BREAK-FIT Commits
# ==============================================================================
set -e

echo "[1/6] Database migrations & RPCs..."
git add supabase/migrations/
git commit -m "feat(db): establish authoritative PostgreSQL ordering engine, atomic RPCs, and RLS"

echo "[2/6] Domain types & centralized ETA Engine..."
git add web/src/lib/types.ts web/src/lib/etaEngine.ts web/src/lib/orderService.ts
git commit -m "feat(engine): implement centralized ETA calculation and authoritative orderService"

echo "[3/6] Student Ordering, BREAK-FIT & Checkout features..."
git add web/src/features/ordering/ web/src/features/break-fit/ web/src/features/menu/
git commit -m "feat(ordering): build checkout modal, live order tracking, and dynamic BREAK-FIT filter"

echo "[4/6] Kitchen Operations Kanban & Inventory Controls..."
git add web/src/features/kitchen/ web/src/app/routes.tsx
git commit -m "feat(kitchen): implement Kanban queue, raw stock management, and dish publishing"

echo "[5/6] Documentation for Stage 3..."
git add docs/orders.md docs/kitchen-operations.md docs/eta-and-break-fit.md docs/migration-plan.md docs/testing.md
git commit -m "docs: add authoritative orders, kitchen operations, and ETA engine specifications"

echo "[6/6] Automated testing suites & CI updates..."
git add web/src/test/ .github/workflows/ci.yml
git commit -m "test: add Vitest suites for ETA engine, orderService idempotency, and shell flow"

echo "=============================================================================="
echo "Stage 3 commits created successfully!"
echo "Run 'git push' to push to GitHub."
echo "=============================================================================="
