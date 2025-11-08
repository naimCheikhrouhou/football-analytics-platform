#!/bin/bash

# Deployment script for Football Analytics Platform
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Deploying to $ENVIRONMENT..."

# Check if .env file exists
if [ ! -f ".env.$ENVIRONMENT" ]; then
    echo "❌ Error: .env.$ENVIRONMENT not found"
    echo "Please create .env.$ENVIRONMENT with your production variables"
    exit 1
fi

# Load environment variables
export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)

echo "✅ Environment variables loaded"

# Check required variables
REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "HASURA_GRAPHQL_DATABASE_URL"
    "HASURA_GRAPHQL_ADMIN_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set"
        exit 1
    fi
done

echo "✅ All required variables are set"

# Deploy based on platform
if [ "$DEPLOY_PLATFORM" == "render" ]; then
    echo "📦 Deploying to Render..."
    # Render deployment via Git push
    git push origin main
elif [ "$DEPLOY_PLATFORM" == "railway" ]; then
    echo "📦 Deploying to Railway..."
    railway up
elif [ "$DEPLOY_PLATFORM" == "docker" ]; then
    echo "📦 Deploying with Docker..."
    docker-compose -f docker-compose.prod.yml up -d
else
    echo "⚠️  No deployment platform specified"
    echo "Set DEPLOY_PLATFORM to: render, railway, or docker"
fi

echo "✅ Deployment complete!"

