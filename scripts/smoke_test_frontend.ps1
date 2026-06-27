$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$FrontendPath = Join-Path $Root "frontend"
$NodeModulesPath = Join-Path $FrontendPath "node_modules"

function Write-Pass {
    param([string]$Name)
    Write-Host "PASS $Name" -ForegroundColor Green
}

function Write-Fail {
    param(
        [string]$Name,
        [string]$Message
    )
    Write-Host "FAIL $Name" -ForegroundColor Red
    Write-Host $Message
}

function Invoke-Check {
    param(
        [string]$Name,
        [scriptblock]$Command
    )

    try {
        & $Command
        Write-Pass $Name
    }
    catch {
        Write-Fail $Name $_.Exception.Message
        exit 1
    }
}

if (-not (Test-Path $FrontendPath)) {
    Write-Fail "Frontend directory" "Expected frontend directory at $FrontendPath"
    exit 1
}

Set-Location $FrontendPath

Invoke-Check "Frontend dependencies" {
    if (-not (Test-Path $NodeModulesPath)) {
        throw "Dependencies are not installed. Run 'cd frontend; npm install' first."
    }
}

Invoke-Check "Frontend lint" {
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        throw "npm run lint failed with exit code $LASTEXITCODE"
    }
}

Invoke-Check "Frontend build" {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "npm run build failed with exit code $LASTEXITCODE"
    }
}

Write-Host "Frontend smoke test completed successfully." -ForegroundColor Green
