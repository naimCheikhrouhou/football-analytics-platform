#!/bin/bash

# Environment variables checker
# Usage: ./scripts/check-env.sh [environment]

set -e

ENVIRONMENT=${1:-production}
ENV_FILE=".env.$ENVIRONMENT"

echo "🔍 Checking environment variables for $ENVIRONMENT..."

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found"
    exit 1
fi

# Load environment variables
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Check required variables
REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "HASURA_GRAPHQL_DATABASE_URL"
    "HASURA_GRAPHQL_ADMIN_SECRET"
    "HASURA_GRAPHQL_JWT_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        echo "✅ $var is set"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Missing required variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    exit 1
fi

echo ""
echo "✅ All required environment variables are set!"

# Validate URLs
echo ""
echo "🔍 Validating URLs..."

if [[ ! "$SUPABASE_URL" =~ ^https:// ]]; then
    echo "⚠️  Warning: SUPABASE_URL should use HTTPS"
fi

if [ ! -z "$NEXT_PUBLIC_HASURA_GRAPHQL_URL" ]; then
    if [[ ! "$NEXT_PUBLIC_HASURA_GRAPHQL_URL" =~ ^https:// ]]; then
        echo "⚠️  Warning: NEXT_PUBLIC_HASURA_GRAPHQL_URL should use HTTPS"
    fi
fi

echo "✅ URL validation complete"

