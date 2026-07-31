#!/bin/bash
set -e

echo "🚀 Preparing Marigold Insights for Production Deployment..."

echo "📦 Running production build and linting checks..."
npm run build
npm run lint

echo "✅ Build and Lint passed successfully!"

echo "🔄 Committing updates to GitHub..."
git add .
git commit -m "Deploy: Production update - $(date +'%Y-%m-%d %H:%M')" || echo "No changes to commit"
git push origin main

echo "🌐 The code has been pushed to GitHub."
echo "✅ Vercel will automatically trigger a production deployment from the 'main' branch."
echo "Use 'npx vercel logs' or check the Vercel dashboard if you encounter any routing or aliasing issues."
