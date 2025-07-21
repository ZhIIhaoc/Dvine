#!/bin/bash

echo "🚀 Starting DVINE with dynamic Stripe webhook integration..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create shared directory if it doesn't exist
mkdir -p ./shared

# Start Stripe CLI first to generate webhook secret
echo "📡 Starting Stripe CLI..."
docker-compose up stripe-cli -d

# Wait for webhook secret generation
echo "⏳ Waiting for webhook secret generation..."
WEBHOOK_SECRET=""
for i in {1..30}; do
    if [ -f "./shared/webhook_secret.txt" ]; then
        WEBHOOK_SECRET=$(cat ./shared/webhook_secret.txt)
        if [ -n "$WEBHOOK_SECRET" ]; then
            echo "🔑 Webhook secret generated: $WEBHOOK_SECRET"
            break
        fi
    fi
    
    # Also check container logs for webhook secret
    LOGS=$(docker-compose logs stripe-cli 2>/dev/null || echo "")
    WEBHOOK_SECRET=$(echo "$LOGS" | grep -o 'whsec_[a-zA-Z0-9]*' | head -1)
    
    if [ ! -z "$WEBHOOK_SECRET" ]; then
        echo "🔑 Webhook secret found in logs: $WEBHOOK_SECRET"
        echo "$WEBHOOK_SECRET" > ./shared/webhook_secret.txt
        break
    fi
    
    echo "   Waiting... ($i/30)"
    sleep 2
done

if [ -z "$WEBHOOK_SECRET" ]; then
    echo "❌ Failed to generate webhook secret after 60 seconds"
    exit 1
fi

# Export the webhook secret and start all remaining services
echo "🐳 Starting all services with dynamic webhook secret..."
export STRIPE_WEBHOOK_SECRET="$WEBHOOK_SECRET"
docker-compose up db redis backend frontend -d

echo ""
echo "✅ All services started with dynamic webhook secret!"
echo "🔑 Webhook Secret: $WEBHOOK_SECRET"
echo ""
echo "📋 Services running:"
echo "   - Stripe CLI: Listening for webhooks"
echo "   - Database: localhost:3306"
echo "   - Redis: localhost:6379"
echo "   - Backend: localhost:8080"
echo "   - Frontend: localhost:5173"
echo ""
echo "🧪 Test webhooks with:"
echo "   docker run --rm --network dvine_dvine-network stripe/stripe-cli:latest trigger payment_intent.succeeded --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv"