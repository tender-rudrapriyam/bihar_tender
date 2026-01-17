#!/bin/bash

# Bihar Tender Monitor - Git Push Script
# Pushes to: https://github.com/tender-rudrapriyam/bihar_tender.git

echo "🚀 Pushing to GitHub Repository..."
echo "Repository: https://github.com/tender-rudrapriyam/bihar_tender.git"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git remote add origin https://github.com/tender-rudrapriyam/bihar_tender.git
fi

# Add all files
echo "📦 Adding files..."
git add .

# Commit
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update Bihar Tender Monitor - $(date)"
fi
git commit -m "$commit_msg"

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 View at: https://github.com/tender-rudrapriyam/bihar_tender"
    echo ""
    echo "Next: Configure GitHub Secrets for CI/CD"
    echo "Go to: https://github.com/tender-rudrapriyam/bihar_tender/settings/secrets/actions"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "1. Set up Git credentials"
    echo "2. Check repository permissions"
    echo "3. Pull latest changes first: git pull origin main"
fi
