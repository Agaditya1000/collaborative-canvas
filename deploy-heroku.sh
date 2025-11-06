#!/bin/bash
# Quick Heroku Deployment Script

echo "🚀 Starting Heroku Deployment..."
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed!"
    echo "📥 Install from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku first:"
    echo "   heroku login"
    exit 1
fi

# Check if app exists
if ! heroku apps:info &> /dev/null; then
    echo "📦 Creating Heroku app..."
    heroku create
else
    echo "✅ Heroku app already exists"
fi

echo ""
echo "📤 Deploying to Heroku..."
git add .
git commit -m "Deploy to Heroku" || echo "No changes to commit"
git push heroku main || git push heroku master

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Opening your app..."
heroku open

echo ""
echo "📊 View logs with: heroku logs --tail"

