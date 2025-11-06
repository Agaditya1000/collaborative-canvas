# 🚀 Quick Heroku Deployment Guide

## Step 1: Install Heroku CLI

### Windows (Recommended):
1. Download installer: https://devcenter.heroku.com/articles/heroku-cli
2. Run the installer
3. Restart your terminal/PowerShell

### Alternative (if you have Chocolatey):
```powershell
choco install heroku-cli
```

### Alternative (if you have Scoop):
```powershell
scoop install heroku
```

---

## Step 2: Login to Heroku

After installing, run:
```bash
heroku login
```

This will open a browser window for authentication.

---

## Step 3: Deploy

Once logged in, run these commands:

```bash
# Stage all changes
git add .

# Commit changes
git commit -m "Prepare for Heroku deployment"

# Create Heroku app (choose a unique name)
heroku create your-app-name

# Or let Heroku generate a name
heroku create

# Deploy to Heroku
git push heroku main
```

**Note:** If your default branch is `master` instead of `main`:
```bash
git push heroku master
```

---

## Step 4: Open Your App

```bash
heroku open
```

---

## ✅ That's It!

Your app will be live at: `https://your-app-name.herokuapp.com`

---

## 📊 Useful Commands

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Restart app
heroku restart

# View app info
heroku info
```

---

## 🐛 Troubleshooting

**If deployment fails:**
1. Check logs: `heroku logs --tail`
2. Verify `Procfile` exists with: `web: node server/server.js`
3. Ensure `package.json` has `start` script
4. Check that all dependencies are listed in `package.json`

