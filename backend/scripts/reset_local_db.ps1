param(
  [switch]$SeedMeals
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $backendDir

if (Test-Path 'db.sqlite3') {
  Remove-Item -LiteralPath 'db.sqlite3' -Force
}

python manage.py migrate

if ($SeedMeals.IsPresent) {
  python manage.py seed_meals
}

Write-Host 'Local database reset complete.'
