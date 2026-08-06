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
echo "🌐 Pushing code to GitHub..."
git push origin main

echo "🚀 Deploying to Vercel Production..."
npx -y vercel --prod

echo "✅ Vercel deployment completed successfully!"
