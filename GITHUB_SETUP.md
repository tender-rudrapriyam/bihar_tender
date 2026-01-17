# GitHub Setup Guide - Bihar Tender Monitor

Repository: **https://github.com/tender-rudrapriyam/bihar_tender.git**

---

## 🚀 Quick Push to GitHub

### Windows:
```batch
git-push.bat
```

### Linux/Mac:
```bash
chmod +x git-push.sh
./git-push.sh
```

---

## 📋 Step-by-Step GitHub Setup

### 1. Initial Setup (First Time Only)

```bash
# Navigate to project
cd D:\QuantAlgo_CrudeOil-FastUvi\bihar-tender-system

# Initialize Git (if not already)
git init

# Add remote repository
git remote add origin https://github.com/tender-rudrapriyam/bihar_tender.git

# Configure Git user (if not set)
git config --global user.name "tender-rudrapriyam"
git config --global user.email "tender.rudrapriyam@gmail.com"
```

### 2. Push Code to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Bihar Tender Monitor"

# Push to GitHub
git push -u origin main
```

If you get an error about divergent branches:
```bash
git pull origin main --rebase
git push -u origin main
```

---

## 🔐 Configure GitHub Secrets (Required for CI/CD)

### Go to Repository Settings:
https://github.com/tender-rudrapriyam/bihar_tender/settings/secrets/actions

### Add These Secrets:

#### Required Secrets:

1. **DATABASE_URL**
   ```
   postgresql://user:password@your-server:5432/bihar_tenders
   ```

2. **JWT_SECRET**
   ```
   your-super-secret-jwt-key-min-32-characters
   ```
   Generate one: https://randomkeygen.com/

3. **SENDGRID_API_KEY**
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Get from: https://app.sendgrid.com/settings/api_keys

4. **EMAIL_FROM**
   ```
   tender.rudrapriyam@gmail.com
   ```

#### Optional Secrets (for deployment):

5. **DEPLOY_HOST**
   ```
   your-server-ip-address
   ```

6. **DEPLOY_USER**
   ```
   your-ssh-username
   ```

7. **DEPLOY_KEY**
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   your-ssh-private-key
   -----END OPENSSH PRIVATE KEY-----
   ```

8. **TELEGRAM_BOT_TOKEN** (optional)
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

9. **TELEGRAM_CHAT_ID** (optional)
   ```
   123456789
   ```

---

## 🤖 GitHub Actions Workflows

After pushing to GitHub, these will run automatically:

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)
**Triggers:** On every push to `main` or `develop`

**Actions:**
- ✅ Runs tests
- ✅ Lints code
- ✅ Builds Docker images
- ✅ Deploys to production (if configured)

### 2. Daily Scraper (`.github/workflows/scraper.yml`)
**Triggers:** Daily at 9:00 AM IST (3:30 AM UTC)

**Actions:**
- ✅ Runs web scraper
- ✅ Saves new tenders to database
- ✅ Sends email notifications
- ✅ Logs results

**Manual Trigger:**
Go to: https://github.com/tender-rudrapriyam/bihar_tender/actions
Click "Daily Tender Scraper" → "Run workflow"

---

## 📧 Email Notifications from GitHub Actions

The GitHub Actions workflow will send you an email when:
- ✅ Scraper runs successfully
- ❌ Scraper fails
- ✅ Deployment completes
- ❌ Deployment fails

Emails go to: **tender.rudrapriyam@gmail.com**

---

## 🔧 Modify Scraper Schedule

Edit `.github/workflows/scraper.yml`:

```yaml
on:
  schedule:
    # Change this cron expression
    # Current: 3:30 AM UTC = 9:00 AM IST
    - cron: '30 3 * * *'
    
    # Examples:
    # Every 6 hours: '0 */6 * * *'
    # Twice daily (9 AM & 6 PM IST): '30 3,12 * * *'
    # Every hour: '0 * * * *'
```

Cron helper: https://crontab.guru/

---

## 📊 View GitHub Actions Logs

### See Scraper Runs:
https://github.com/tender-rudrapriyam/bihar_tender/actions/workflows/scraper.yml

### See CI/CD Pipeline:
https://github.com/tender-rudrapriyam/bihar_tender/actions/workflows/ci.yml

### View Latest Run:
https://github.com/tender-rudrapriyam/bihar_tender/actions

---

## 🐛 Troubleshooting

### Push rejected?
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push -u origin main
```

### Authentication failed?
```bash
# Use Personal Access Token (PAT)
# Generate at: https://github.com/settings/tokens

# When prompted for password, use PAT instead
```

### GitHub Actions not running?
1. Check you've enabled Actions: Settings → Actions → Enable
2. Verify secrets are set correctly
3. Check workflow files have no syntax errors

### Scraper job failing?
1. View logs: Actions → Daily Tender Scraper → Latest run
2. Check DATABASE_URL is correct
3. Verify SENDGRID_API_KEY works
4. Ensure server is accessible

---

## 🔄 Regular Workflow

### Daily Usage:
1. GitHub Actions runs scraper automatically at 9 AM IST
2. New tenders saved to database
3. Email sent to tender.rudrapriyam@gmail.com
4. Check dashboard or email for updates

### When Making Changes:
```bash
# 1. Edit files
# 2. Test locally
cd backend && npm run dev

# 3. Commit and push
git add .
git commit -m "Your change description"
git push origin main

# 4. GitHub Actions will auto-deploy
```

---

## 📦 Clone on Another Machine

```bash
# Clone repository
git clone https://github.com/tender-rudrapriyam/bihar_tender.git
cd bihar_tender

# Setup
setup.bat  # or ./setup.sh

# Configure .env
cp .env.example .env
# Edit .env with your settings

# Run
docker-compose up -d
```

---

## 🎯 Repository Structure

```
https://github.com/tender-rudrapriyam/bihar_tender
├── .github/workflows/
│   ├── ci.yml           # CI/CD pipeline
│   └── scraper.yml      # Daily scraper
├── backend/             # API server
├── scraper/             # Web scraper
├── docker-compose.yml   # Docker setup
└── README.md            # Documentation
```

---

## ✅ Verification Checklist

After pushing to GitHub:

- [ ] Repository visible at https://github.com/tender-rudrapriyam/bihar_tender
- [ ] All files committed and pushed
- [ ] GitHub Actions enabled
- [ ] Required secrets configured
- [ ] CI/CD pipeline passes (green checkmark)
- [ ] Daily scraper scheduled
- [ ] Email notifications working

---

## 🔗 Important Links

**Repository:**
https://github.com/tender-rudrapriyam/bihar_tender

**Actions Dashboard:**
https://github.com/tender-rudrapriyam/bihar_tender/actions

**Settings:**
https://github.com/tender-rudrapriyam/bihar_tender/settings

**Secrets:**
https://github.com/tender-rudrapriyam/bihar_tender/settings/secrets/actions

**Clone URL:**
```
https://github.com/tender-rudrapriyam/bihar_tender.git
```

---

## 📞 Need Help?

- Email: tender.rudrapriyam@gmail.com
- GitHub Issues: https://github.com/tender-rudrapriyam/bihar_tender/issues
- GitHub Discussions: https://github.com/tender-rudrapriyam/bihar_tender/discussions

---

**Ready to push? Run `git-push.bat` (Windows) or `./git-push.sh` (Linux/Mac)!** 🚀
