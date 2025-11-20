# Cleanup script to remove temporary and unnecessary files from backend directory
# Usage: powershell -ExecutionPolicy Bypass -File cleanup.ps1

Write-Host "🧹 Starting cleanup of backend directory..." -ForegroundColor Cyan
Write-Host ""

$itemsToRemove = @(
    @{Path = "__pycache__"; Type = "Directory"; Description = "Python bytecode cache" },
    @{Path = "inspection.log"; Type = "File"; Description = "Runtime log file" },
    @{Path = "output"; Type = "Directory"; Description = "Temporary generated reports" },
    @{Path = "src"; Type = "Directory"; Description = "Test files directory" },
    @{Path = "cad_feature_test.py"; Type = "File"; Description = "Test script with hardcoded paths" },
    @{Path = "venv"; Type = "Directory"; Description = "Duplicate virtual environment (keeping .venv)" }
)

$removedCount = 0
$skippedCount = 0

foreach ($item in $itemsToRemove) {
    $path = $item.Path
    $exists = if ($item.Type -eq "Directory") { 
        Test-Path -Path $path -PathType Container 
    } else { 
        Test-Path -Path $path -PathType Leaf 
    }
    
    if ($exists) {
        try {
            if ($item.Type -eq "Directory") {
                Remove-Item -Path $path -Recurse -Force
                Write-Host "✅ Removed directory: $path ($($item.Description))" -ForegroundColor Green
            } else {
                Remove-Item -Path $path -Force
                Write-Host "✅ Removed file: $path ($($item.Description))" -ForegroundColor Green
            }
            $removedCount++
        } catch {
            Write-Host "❌ Failed to remove $path : $_" -ForegroundColor Red
            $skippedCount++
        }
    } else {
        Write-Host "⏭️  Skipped: $path (not found)" -ForegroundColor Yellow
        $skippedCount++
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Removed: $removedCount items" -ForegroundColor Green
Write-Host "  ⏭️  Skipped: $skippedCount items" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Cleanup complete!" -ForegroundColor Green

