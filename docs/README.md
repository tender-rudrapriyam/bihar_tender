# Bihar Tender Monitor - Complete System

A production-ready tender monitoring system with automated scraping, analysis, and email notifications.

## 🚀 Features

- ✅ **Automated Daily Scraping** - Fetches tenders from Bihar e-procurement portal
- ✅ **PostgreSQL Database** - Stores all tender data with full history
- ✅ **Email Notifications** - Sends daily briefs to tender.rudrapriyam@gmail.com
- ✅ **GitHub CI/CD** - Automated testing and deployment
- ✅ **Docker Ready** - One-command deployment
- ✅ **Smart Filtering** - Keyword and department matching
- ✅ **Analytics** - Track tender trends and insights

## 📋 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 2. Start all services
docker-compose up -d

# 3. View logs
docker-compose logs -f

# Access services:
# - Backend API: http://localhost:5000
# - Frontend: http://localhost:3000
# - PGAdmin: http://localhost:5050
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../scraper && npm install

# 2. Setup database
cd backend
npx prisma migrate dev
npx prisma generate

# 3. Start services
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Scraper
cd scraper && npm start
```

## 📂 Project Structure

```
bihar-tender-system/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── app.js       # Express server
│   │   ├── routes/      # API endpoints
│   │   └── services/    # Email, analytics
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
│
├── scraper/              # Web scraper
│   ├── src/
│   │   └── scraper.js   # Puppeteer scraper
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci-cd.yml            # CI/CD pipeline
│       └── scraper-cron.yml     # Daily automation
│
├── docker-compose.yml    # Docker orchestration
└── .env.example         # Configuration template
```

## ⚙️ Configuration

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://tender_user:password@localhost:5432/bihar_tenders

# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=tender.rudrapriyam@gmail.com

# Server
PORT=5000
JWT_SECRET=your-secret-key

# Scraper
SCRAPER_INTERVAL=86400000  # 24 hours
```

## 🔄 Daily Automation

The system automatically:
1. Scrapes Bihar e-procurement at 9 AM IST daily
2. Saves new tenders to database
3. Matches tenders with user subscriptions
4. Sends email notifications
5. Generates analytics

### Setup GitHub Actions

1. Push code to GitHub
2. Add secrets in Settings → Secrets:
   - `DATABASE_URL`
   - `SENDGRID_API_KEY`
   - `JWT_SECRET`
3. GitHub Actions will run automatically

## 📧 Email System

**Features:**
- Beautiful HTML templates
- Daily digest summaries
- Real-time alerts for matching tenders
- Customizable preferences

**Email sent to:** tender.rudrapriyam@gmail.com

## 🗄️ Database Schema

**Main Tables:**
- `users` - User accounts
- `tenders` - Tender information
- `subscriptions` - Keyword subscriptions
- `notifications` - Email queue
- `scraper_logs` - Scraping history
- `tender_analytics` - Statistics

## 📊 API Endpoints

```
GET  /health                    # Health check
GET  /api/tenders               # List tenders
GET  /api/tenders/:id           # Get tender details
GET  /api/tenders/search?q=...  # Search tenders
GET  /api/tenders/stats         # Statistics
POST /api/notifications/test    # Test email
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Scraper test
cd scraper && npm start
```

## 📈 Monitoring

**Logs:**
- Backend: `backend/logs/combined.log`
- Scraper: `scraper/logs/scraper.log`
- Email: `backend/logs/email.log`

**Database GUI:**
```bash
cd backend && npx prisma studio
# Opens at http://localhost:5555
```

## 🚢 Deployment

### Deploy to VPS

```bash
# 1. SSH to server
ssh user@your-server.com

# 2. Clone repository
git clone <your-repo-url>
cd bihar-tender-system

# 3. Configure
cp .env.example .env
# Edit .env

# 4. Deploy
docker-compose up -d
```

### Auto-deploy with GitHub Actions

Push to main branch - GitHub Actions will:
1. Run tests
2. Build Docker images
3. Deploy to server
4. Send notifications

## 🔧 Troubleshooting

**Scraper fails:**
```bash
# Check logs
tail -f scraper/logs/scraper.log

# Test manually
cd scraper && node src/scraper.js
```

**Email not sending:**
```bash
# Test email service
cd backend
node -e "require('./src/services/email').sendDailyDigest()"
```

**Database issues:**
```bash
# Reset database
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

## 💡 Additional Features to Add

- 📱 WhatsApp notifications (Twilio)
- 🤖 ML predictions for tender success
- 📝 PDF document parsing
- 📊 Analytics dashboard
- 🗺️ Geographic visualization
- 📱 Mobile app (React Native)
- 👥 Multi-user support
- 🔔 Real-time notifications (WebSocket)

## 📚 Documentation

- `SETUP_GUIDE.md` - Detailed setup instructions
- `PROJECT_OVERVIEW.md` - Architecture details
- `backend/README.md` - Backend API docs
- `scraper/README.md` - Scraper docs

## 🆘 Support

- **Email:** tender.rudrapriyam@gmail.com
- **Issues:** Create GitHub issue
- **Docs:** See SETUP_GUIDE.md

## 📜 License

MIT License

---

**Built with:** Node.js • PostgreSQL • Puppeteer • Docker • GitHub Actions
