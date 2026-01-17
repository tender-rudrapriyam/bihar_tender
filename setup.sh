#!/bin/bash

echo "🚀 Bihar Tender Monitor - Quick Setup Script"
echo "=============================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running the app"
else
    echo "✅ .env file exists"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Setup database (optional, user should configure DB first)
echo ""
echo "📊 Database setup..."
echo "⚠️  Make sure PostgreSQL is running and DATABASE_URL is configured in .env"
read -p "Do you want to run database migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name init
    if [ $? -eq 0 ]; then
        echo "✅ Database migrations completed"
    else
        echo "⚠️  Database migrations failed. You can run them later with: npx prisma migrate dev"
    fi
fi

cd ..

# Install scraper dependencies
echo ""
echo "📦 Installing scraper dependencies..."
cd scraper
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install scraper dependencies"
    exit 1
fi

echo "✅ Scraper dependencies installed"
cd ..

# Create log directories
echo ""
echo "📁 Creating log directories..."
mkdir -p backend/logs
mkdir -p scraper/logs
mkdir -p scraper/downloads
echo "✅ Log directories created"

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Make sure PostgreSQL is running"
echo "3. Run backend: cd backend && npm run dev"
echo "4. Run scraper: cd scraper && npm start"
echo ""
echo "Or use Docker:"
echo "  docker-compose up -d"
echo ""
echo "For detailed instructions, see SETUP_GUIDE.md"
echo ""
