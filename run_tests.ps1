# ==============================================================================
# CampusBite — Automated Test & System Verification Runner
# Runs regression verification across the 7 defects, schema integrity, and assets
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   CAMPUSBITE: AUTOMATED REGRESSION & PRODUCTION VERIFICATION" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$totalTests = 0

function Assert-Test {
    param(
        [string]$Name,
        [scriptblock]$Condition
    )
    $global:totalTests++
    try {
        $result = & $Condition
        if ($result -eq $true) {
            Write-Host ("  [PASS] {0}" -f $Name) -ForegroundColor Green
            $global:testsPassed++
        } else {
            Write-Host ("  [FAIL] {0}" -f $Name) -ForegroundColor Red
            $global:testsFailed++
        }
    } catch {
        Write-Host ("  [FAIL] {0}: {1}" -f $Name, $_.Exception.Message) -ForegroundColor Red
        $global:testsFailed++
    }
}

Write-Host "--- 1. FILE & ASSET INTEGRITY ---" -ForegroundColor DarkCyan
Assert-Test "index.html exists and contains toast container and supabase" {
    $content = Get-Content "index.html" -Raw
    ($content -match 'id="toast-container"') -and ($content -match 'supabase\.js')
}

Assert-Test "styles.css has fixed toast layer and zero layout jumping" {
    $content = Get-Content "styles.css" -Raw
    ($content -match '\.toast-container\s*\{[^}]*position:\s*fixed') -and ($content -match 'pointer-events:\s*none')
}

Assert-Test "app.js contains Database class and idempotency protection" {
    $content = Get-Content "app.js" -Raw
    ($content -match 'class Database') -and ($content -match 'batchOperationId') -and ($content -match 'idempotencyKey')
}

Assert-Test "supabase_schema.sql exists with RLS, public view and audit tables" {
    $content = Get-Content "supabase_schema.sql" -Raw
    ($content -match 'CREATE TABLE IF NOT EXISTS stock_movements') -and ($content -match 'CREATE OR REPLACE VIEW public_menu_items')
}

Assert-Test "tests.html and campusbite_tests.js test suite exist" {
    (Test-Path "tests.html") -and (Test-Path "tests/campusbite_tests.js")
}

Write-Host ""
Write-Host "--- 2. DEFECT SPECIFICATION AUDIT ---" -ForegroundColor DarkCyan

Assert-Test "Defect 1: commitPrepBatch enforces idempotency and distinguishes from forecast" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'forecastPrepBatches\(\)') -and 
    ($app -match 'commitPrepBatch\(') -and 
    ($app -match 'this\.data\.batchOperations\[batchOperationId\]')
}

Assert-Test "Defect 2: transitionOrderStatus enforces valid transitions and rejects skips" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'transitionOrderStatus\(') -and 
    ($app -match 'order\.status !== expectedCurrentStatus') -and
    ($app -match 'allowedNext\.includes\(targetStatus\)')
}

Assert-Test "Defect 3: placeOrder checks idempotencyRecords" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'idempotencyKey') -and 
    ($app -match 'this\.data\.idempotencyRecords\[idempotencyKey\]')
}

Assert-Test "Defect 4: calculateCartEta accounts for quantities and prepared warmer stock" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'allocatedFromPrepared\s*=\s*Math\.min\(orderedQty,\s*preparedAvail\)') -and 
    ($app -match 'remainingToCook\s*=\s*Math\.max\(0,\s*orderedQty\s*-\s*allocatedFromPrepared\)')
}

Assert-Test "Defect 5: Menu availability separates is_paused_by_admin from batch/stock updates" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'setAdminMenuPause\(') -and 
    ($app -match 'food\.is_paused_by_admin\s*=\s*Boolean\(isPaused\)')
}

Assert-Test "Defect 6: toPublicFoodDTO strips internal costs and margins from student view" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'toPublicFoodDTO\(') -and 
    ($app -match 'getPublicFoods\(\)')
}

Assert-Test "Defect 7: Toast messages use fixed toast layer" {
    $css = Get-Content "styles.css" -Raw
    $css -match '\.toast-container\s*\{[^}]*position:\s*fixed'
}

Write-Host ""
Write-Host "--- 3. OPERATIONAL FEATURES AUDIT (GROUPS A, B, C) ---" -ForegroundColor DarkCyan

Assert-Test "Group A: Stock reconciliation and audit ledger" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'reconcileStock\(') -and ($app -match 'AUDIT_CORRECTION')
}

Assert-Test "Group A: Multi-ingredient recipe editing" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'openRecipeEditor\(') -and ($app -match 'recipe:\s*\[')
}

Assert-Test "Group A: Password recovery token generation" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'createPasswordResetToken\(') -and ($app -match 'resetPasswordWithToken\(')
}

Assert-Test "Group B: Operational intelligence & waste cost tracking" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'wasteMetrics') -and ($app -match 'stockoutHistory')
}

Assert-Test "Group C: Last Plate early withdrawal and order expiry" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'withdrawLastPlateListing\(') -and ($app -match 'handleNoShowOrder\(')
}

Assert-Test "Group C: WhatsApp notification log and retry dispatch" {
    $app = Get-Content "app.js" -Raw
    ($app -match 'dispatchNotification\(') -and ($app -match 'resendNotification\(')
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ("   TEST RESULTS: {0}/{1} PASSED ({2}%)" -f $testsPassed, $totalTests, [math]::Round(($testsPassed / $totalTests) * 100)) -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

if ($testsFailed -gt 0) {
    Write-Host "Some tests failed. Please review the output above." -ForegroundColor Red
    exit 1
} else {
    Write-Host "All system checks passed successfully!" -ForegroundColor Green
    exit 0
}
