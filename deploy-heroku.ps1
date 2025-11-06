# Quick Heroku Deployment Script for PowerShell

Write-Host "🚀 Starting Heroku Deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if Heroku CLI is installed
try {
    $null = Get-Command heroku -ErrorAction Stop
} catch {
    Write-Host "❌ Heroku CLI is not installed!" -ForegroundColor Red
    Write-Host "📥 Install from: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Heroku
try {
    $null = heroku auth:whoami 2>&1
} catch {
    Write-Host "🔐 Please login to Heroku first:" -ForegroundColor Yellow
    Write-Host "   heroku login" -ForegroundColor White
    exit 1
}

# Check if app exists
try {
    $null = heroku apps:info 2>&1
    Write-Host "✅ Heroku app already exists" -ForegroundColor Green
} catch {
    Write-Host "📦 Creating Heroku app..." -ForegroundColor Yellow
    heroku create
}

Write-Host ""
Write-Host "📤 Deploying to Heroku..." -ForegroundColor Cyan
git add .
git commit -m "Deploy to Heroku" 2>&1 | Out-Null
$branch = git branch --show-current
if ($branch -eq "main") {
    git push heroku main
} else {
    git push heroku master
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Opening your app..." -ForegroundColor Cyan
heroku open

Write-Host ""
Write-Host "📊 View logs with: heroku logs --tail" -ForegroundColor Yellow

