# 🚀 START HERE - Complete Setup Guide

## ✅ Your GitHub Repository
**https://github.com/tender-rudrapriyam/bihar_tender.git**

All code will sync to this repository automatically!

---

## 📍 Current Location
```
D:\QuantAlgo_CrudeOil-FastUvi\bihar-tender-system\
```

---

## 🎯 QUICK START - 3 Simple Steps

### Step 1: Run Setup (5 minutes)
```batch
setup.bat
```
This installs all dependencies and sets up the database.

### Step 2: Configure Email (2 minutes)
Edit `.env` file and add your SendGrid API key:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your-key-here
EMAIL_FROM=tender.rudrapriyam@gmail.com
```

Get free SendGrid key: https://sendgrid.com/ (100 emails/day free)

### Step 3: Push to GitHub (1 minute)
```batch
git-push.bat
```
This pushes your code to GitHub and enables automatic daily scraping!

**That's it! 🎉**

---

## 🤖 What Happens After GitHub Push?

### Automatic Daily Scraping (9 AM IST)
- ✅ GitHub Actions runs scraper automatically
- ✅ New tenders saved to database
- ✅ Email sent to tender.rudrapriyam@gmail.com
- ✅ No manual intervention needed!

### Manual Trigger Anytime
Go to: https://github.com/tender-rudrapriyam/bihar_tender/actions
Click "Daily Tender Scraper" → "Run workflow"

---

## 📧 Email Setup (REQUIRED)

You MUST configure email to receive tender notifications.

### Option 1: SendGrid (Recommended - Free)
1. Sign up: https://sendgrid.com/
2. Verify your email
3. Create API Key:
   - Settings → API Keys → Create API Key
   - Full Access
   - Copy the key (starts with `SG.`)
4. Add to `.env`:
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=tender.rudrapriyam@gmail.com
   ```

### Option 2: Gmail
1. Enable 2-Step Verification in Google Account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification
   - App Passwords → "Mail" + "Windows Computer"
   - Copy 16-character password
3. Add to `.env`:
   ```env
   EMAIL_SERVICE=gmail
   GMAIL_USER=tender.rudrapriyam@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=tender.rudrapriyam@gmail.com
   ```

---

## 🗄️ Database Setup

### Option 1: Docker (Easiest)
```batch
docker-compose up -d postgres
```
Database ready at: localhost:5432

### Option 2: Install PostgreSQL
1. Download: https://www.postgresql.org/download/windows/
2. Install and set password
3. Create database:
   ```sql
   CREATE DATABASE bihar_tenders;
   ```
4. Update `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/bihar_tenders
   ```

---

## 🔐 GitHub Secrets Setup (For CI/CD)

After pushing to GitHub, add these secrets:

**Go to:** https://github.com/tender-rudrapriyam/bihar_tender/settings/secrets/actions

**Add:**
1. `DATABASE_URL` - Your database connection string
2. `JWT_SECRET` - Random string (generate at https://randomkeygen.com/)
3. `SENDGRID_API_KEY` - Your SendGrid API key
4. `EMAIL_FROM` - tender.rudrapriyam@gmail.com

See **GITHUB_SETUP.md** for detailed instructions.

---

## 🎮 How to Use

### Daily Automatic Mode (Recommended)
1. Push code to GitHub: `git-push.bat`
2. Configure GitHub Secrets (one-time setup)
3. Done! Scraper runs daily at 9 AM IST automatically
4. Check your email for daily tender updates

### Manual Mode (Testing)
```batch
# Start backend (keep running)
cd backend
npm run dev

# Run scraper (in new terminal)
cd scraper
npm start
```

### Docker Mode (Production)
```batch
docker-compose up -d
```

---

## 📊 Testing Everything

### 1. Test Backend
```batch
cd backend
npm run dev
```
Visit: http://localhost:5000/health
Should see: `{"status":"healthy"}`

### 2. Test Database
```batch
cd backend
npx prisma studio
```
Opens database GUI at: http://localhost:5555

### 3. Test Scraper
```batch
cd scraper
npm start
```
Check: `scraper/logs/scraper.log` for results

### 4. Test Email
After creating a user account, send test email:
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Important Files

### Documentation (Read These!)
- **START_HERE.md** ← You are here!
- **GITHUB_SETUP.md** - GitHub configuration
- **SETUP_GUIDE.md** - Detailed setup instructions
- **PROJECT_STRUCTURE.md** - File organization
- **FILES_COMPLETE.md** - Complete file list

### Configuration
- **.env** - Your local settings (create from .env.example)
- **.env.example** - Template with all options
- **docker-compose.yml** - Docker configuration

### Scripts
- **setup.bat** - Install everything
- **git-push.bat** - Push to GitHub
- **setup.sh** - Linux/Mac setup
- **git-push.sh** - Linux/Mac git push

---

## 🔄 Daily Workflow

### Completely Automated (After GitHub Setup):
1. ✅ 9:00 AM IST - GitHub Actions runs scraper
2. ✅ New tenders extracted from Bihar portal
3. ✅ Tenders saved to database
4. ✅ Email sent to tender.rudrapriyam@gmail.com
5. ✅ Check email or dashboard for updates

**You don't have to do anything!** Everything runs automatically.

---

## 🐛 Common Issues

### Issue: "npm install" fails
**Solution:**
```batch
del package-lock.json
rmdir /s node_modules
npm install
```

### Issue: Database connection error
**Solution:**
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. Test: `psql -U postgres`

### Issue: Git push fails
**Solution:**
```batch
git pull origin main --rebase
git push origin main
```

### Issue: Emails not sending
**Solution:**
1. Check SendGrid/Gmail credentials in `.env`
2. Verify `EMAIL_FROM` is correct
3. Check `backend/logs/email.log`

### Issue: Scraper not finding tenders
**Solution:**
1. Website might have changed structure
2. Check `scraper/logs/scraper.log`
3. Verify website is accessible
4. May need to update selectors in `scraper/src/scraper.js`

---

## 📞 Get Help

**Email:** tender.rudrapriyam@gmail.com

**GitHub Issues:** https://github.com/tender-rudrapriyam/bihar_tender/issues

**Documentation:**
- GITHUB_SETUP.md - GitHub configuration
- SETUP_GUIDE.md - Detailed setup
- PROJECT_STRUCTURE.md - File structure

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] `setup.bat` completed successfully
- [ ] `.env` file configured with email settings
- [ ] Backend starts: `cd backend && npm run dev`
- [ ] Database connects: `npx prisma studio` works
- [ ] Scraper runs: `cd scraper && npm start` completes
- [ ] Pushed to GitHub: `git-push.bat` successful
- [ ] GitHub Secrets configured
- [ ] GitHub Actions enabled
- [ ] Test email received

---

## 🎯 What You Get

### Core Features
✅ **Automated Daily Scraping** - Runs at 9 AM IST via GitHub Actions
✅ **PostgreSQL Database** - 11 tables for complete data storage
✅ **Email Notifications** - Beautiful HTML emails to tender.rudrapriyam@gmail.com
✅ **RESTful API** - 30+ endpoints for tender management
✅ **Smart Filtering** - Keyword-based tender matching
✅ **Analytics** - Statistics and insights on tenders

### Automation
✅ **GitHub Actions** - Daily automated scraping
✅ **Docker Ready** - One-command deployment
✅ **Error Handling** - Automatic error notifications
✅ **Logging** - Complete activity logs

---

## 💰 Cost

### Free Tier (Perfect for Getting Started)
- **GitHub Actions:** Free (2000 minutes/month)
- **SendGrid:** Free (100 emails/day)
- **PostgreSQL:** Free (local) or $0 (ElephantSQL free tier)
- **Total: $0/month**

### Paid Tier (If You Grow)
- **VPS:** $5-10/month (DigitalOcean/Linode)
- **SendGrid Pro:** $15/month (40,000 emails)
- **Managed DB:** $15/month
- **Total: ~$35-40/month**

---

## 🚀 Ready to Launch?

### 3-Step Launch:

1. **Setup** (5 min)
   ```batch
   setup.bat
   ```

2. **Configure** (2 min)
   - Edit `.env` with SendGrid key
   - Verify email settings

3. **Push to GitHub** (1 min)
   ```batch
   git-push.bat
   ```

**Done! Your tender monitoring system is live! 🎉**

---

## 📈 What Happens Next?

### Immediately After Push:
- ✅ GitHub Actions will run CI/CD pipeline
- ✅ Code will be tested automatically
- ✅ Docker images will be built

### Tomorrow at 9 AM IST:
- ✅ Scraper runs automatically
- ✅ New tenders extracted
- ✅ Email sent to tender.rudrapriyam@gmail.com

### Every Day After:
- ✅ Daily scraping at 9 AM IST
- ✅ Automatic email notifications
- ✅ Complete logs and monitoring
- ✅ Zero manual intervention needed!

---

**Ready to begin? Run `setup.bat` now!** 🚀

*All 31 files created and ready to use ✅*
*Repository: https://github.com/tender-rudrapriyam/bihar_tender.git*
