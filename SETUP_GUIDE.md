# 🚀 Complete Setup Guide - Bihar Tender Monitor

## 📁 Files Created

All files are in: `D:\QuantAlgo_CrudeOil-FastUvi\bihar-tender-system\`

```
bihar-tender-system/
├── README.md                    ✅ Main documentation
├── docker-compose.yml           ✅ Docker setup
├── .env.example                 ✅ Configuration template
│
├── backend/                     ✅ API Server
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma       ✅ Database schema
│   └── src/
│       ├── app.js              ✅ Express server
│       └── services/
│           └── email.js        ✅ Email service
│
├── scraper/                     ✅ Web Scraper
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── scraper.js          ✅ Puppeteer scraper
│
└── .github/                     ✅ CI/CD
    └── workflows/
        ├── ci.yml              ✅ Tests & deployment
        └── scraper.yml         ✅ Daily automation
```

## 🎯 Quick Start (3 Options)

### Option 1: Docker (Easiest - Recommended)

```bash
# 1. Navigate to project
cd D:\QuantAlgo_CrudeOil-FastUvi\bihar-tender-system

# 2. Configure environment
copy .env.example .env
# Edit .env with your settings (SendGrid API key, etc.)

# 3. Start everything
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs -f

# Access:
# - Backend: http://localhost:5000
# - PGAdmin: http://localhost:5050 (dev mode)
```

### Option 2: Manual Setup (Full Control)

```bash
# 1. Navigate to project
cd D:\QuantAlgo_CrudeOil-FastUvi\bihar-tender-system

# 2. Setup environment
copy .env.example .env
# Edit .env file

# 3. Install PostgreSQL
# Download from: https://www.postgresql.org/download/
# Create database: bihar_tenders

# 4. Backend setup
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run dev

# 5. Scraper setup (new terminal)
cd scraper
npm install
node src/scraper.js

# Test: http://localhost:5000/health
```

### Option 3: GitHub Actions (Cloud Automation)

```bash
# 1. Create GitHub repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/bihar-tender-monitor.git
git push -u origin main

# 2. Add GitHub Secrets
# Go to: Repository → Settings → Secrets → Actions
# Add these secrets:
# - DATABASE_URL
# - SENDGRID_API_KEY
# - JWT_SECRET

# 3. Done! Scraper runs daily at 9 AM IST automatically
```

## ⚙️ Configuration

### 1. SendGrid Email Setup (Recommended)

1. Sign up at https://sendgrid.com/ (Free: 100 emails/day)
2. Create an API Key
3. Add to `.env`:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=tender.rudrapriyam@gmail.com
```

### 2. Gmail Setup (Alternative)

1. Enable 2-Factor Authentication in Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
```env
EMAIL_SERVICE=gmail
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=tender.rudrapriyam@gmail.com
```

### 3. Database Configuration

```env
# Local PostgreSQL
DATABASE_URL=postgresql://tender_user:password@localhost:5432/bihar_tenders

# Docker
DATABASE_URL=postgresql://tender_user:SecurePass123!@postgres:5432/bihar_tenders

# Cloud (e.g., ElephantSQL, Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## 🧪 Testing Your Setup

### 1. Test Backend

```bash
cd backend
npm run dev

# In browser: http://localhost:5000/health
# Should see: {"status":"healthy","database":"connected"}
```

### 2. Test Database

```bash
cd backend
npx prisma studio

# Opens GUI at: http://localhost:5555
# You can view/edit database records
```

### 3. Test Scraper

```bash
cd scraper
node src/scraper.js

# Should see:
# 🚀 Starting Bihar tender scraper...
# 📡 Navigating to...
# 📊 Found X tender rows
# ✅ Scraping completed
```

### 4. Test Email

```bash
cd backend
node -e "require('./src/services/email').sendDailyDigest()"

# Check tender.rudrapriyam@gmail.com inbox
```

## 📊 Using the System

### API Endpoints

```bash
# Health check
GET http://localhost:5000/health

# List all tenders
GET http://localhost:5000/api/tenders

# Search tenders
GET http://localhost:5000/api/tenders?search=road&department=PWD

# Get statistics
GET http://localhost:5000/api/tenders/stats

# Get scraper logs
GET http://localhost:5000/api/scraper/logs

# Send test email
POST http://localhost:5000/api/notifications/test
```

### Database Access

```bash
# Prisma Studio (GUI)
cd backend && npx prisma studio

# PGAdmin (if using Docker)
http://localhost:5050
# Login: admin@tender.com / admin123
```

## 🔄 Daily Automation

The system scrapes tenders daily and sends emails automatically.

### Using GitHub Actions (Cloud)

Already configured! Just push to GitHub:
- Runs at 9:00 AM IST daily
- Emails sent automatically
- No server needed

### Using Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Bihar Tender Scraper"
4. Trigger: Daily at 9:00 AM
5. Action: Start a program
   - Program: `node`
   - Arguments: `D:\QuantAlgo_CrudeOil-FastUvi\bihar-tender-system\scraper\src\scraper.js`
   - Start in: `D:\QuantAlgo_CrudeOil-FastUvi\bihar-tender-system\scraper`

### Using Cron (Linux/Mac)

```bash
crontab -e

# Add this line (runs at 9 AM daily):
0 9 * * * cd /path/to/bihar-tender-system/scraper && node src/scraper.js
```

## 🐛 Troubleshooting

### Scraper Issues

**Problem:** Can't access website
```bash
# Solution: Check if website is up
curl https://eproc2.bihar.gov.in/EPSV2Web/openarea/tenderListingPage.action

# Or try running with headed mode (see browser)
# Edit scraper/src/scraper.js line 17:
headless: false  # Change from 'new' to false
```

**Problem:** No tenders found
```bash
# Check logs
cat scraper/logs/scraper.log

# Website structure may have changed
# Update selectors in scraper/src/scraper.js
```

### Email Issues

**Problem:** Emails not sending
```bash
# Check SendGrid API key
echo $SENDGRID_API_KEY

# Test email manually
cd backend
node -e "require('./src/services/email').sendDailyDigest()"

# Check logs
tail -f backend/logs/combined.log
```

**Problem:** Emails in spam
- Use SendGrid (better deliverability than Gmail)
- Setup SPF/DKIM records (advanced)
- Add reply-to address

### Database Issues

**Problem:** Connection failed
```bash
# Check PostgreSQL is running
# Windows: services.msc → PostgreSQL
# Linux: sudo systemctl status postgresql

# Test connection
psql -U tender_user -d bihar_tenders

# Reset database
cd backend
npx prisma migrate reset
```

### Docker Issues

**Problem:** Containers not starting
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check ports
netstat -ano | findstr :5000
```

## 🚀 Deployment to Production

### Deploy to Cloud VPS

1. **Get a VPS** (DigitalOcean, AWS, Linode)
   - Min specs: 1 GB RAM, 1 vCPU
   - Cost: ~$5-10/month

2. **SSH to server**
```bash
ssh root@your-server-ip
```

3. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

4. **Clone and deploy**
```bash
git clone https://github.com/yourusername/bihar-tender-monitor.git
cd bihar-tender-monitor
cp .env.example .env
# Edit .env with production values
docker-compose up -d
```

5. **Setup domain** (Optional)
- Point domain to server IP
- Install Nginx
- Get SSL cert with Certbot

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@production-db:5432/bihar_tenders
SENDGRID_API_KEY=your-production-key
JWT_SECRET=very-secure-random-string-here
```

## 📈 Monitoring & Maintenance

### View Logs

```bash
# Backend logs
tail -f backend/logs/combined.log

# Scraper logs
tail -f scraper/logs/scraper.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f scraper
```

### Database Backups

```bash
# Backup database
docker-compose exec postgres pg_dump -U tender_user bihar_tenders > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20240116.sql | docker-compose exec -T postgres psql -U tender_user bihar_tenders
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## 💰 Cost Estimates

### Free Tier
- VPS: $5-10/month (DigitalOcean)
- SendGrid: Free (100 emails/day)
- GitHub: Free
- **Total: $5-10/month**

### Production Tier
- VPS: $20/month (better specs)
- SendGrid: $15/month (40K emails)
- Monitoring: Free (self-hosted)
- **Total: $35/month**

## 📚 Next Steps

1. ✅ Test scraper manually
2. ✅ Verify email delivery
3. ✅ Setup daily automation
4. ✅ Monitor logs for first week
5. ✅ Setup alerts for failures
6. ✅ Add more features

## 🎨 Additional Features to Add

- 📱 Frontend dashboard (React)
- 📲 Mobile app (React Native)
- 🤖 ML predictions
- 📝 PDF parsing
- 🔔 WhatsApp/Telegram notifications
- 📊 Advanced analytics
- 👥 Multi-user support
- 🗺️ Geographic visualization

## 📞 Support

- **Email:** tender.rudrapriyam@gmail.com
- **GitHub:** Create an issue
- **Docs:** See README.md

---

**Everything is ready!** Start with the Quick Start section above.
