# 🎯 DVINE Stripe Webhook Integration Guide

This guide covers how to use the Stripe webhook testing setup with your DVINE application.

## 📋 Overview

The DVINE project includes a simple Stripe CLI integration that allows you to:
- Test webhook events locally during development
- Use dynamic webhook secrets for enhanced security
- Launch all services with proper webhook configuration
- Trigger test events to verify your webhook handling

## 🚀 Quick Start

### Option 1: All Services with Dynamic Webhook (Recommended)

```bash
# Start everything with automatically generated webhook secrets
./stripe-webhook-setup.sh
```

### Option 2: Static Webhook Secret (Fallback)

```bash
# Start all services (uses fallback webhook secret from application.yml)
docker-compose up --build
```

### Option 3: Local Backend Development

```bash
# 1. Start supporting services only
docker-compose up db redis -d

# 2. Start Stripe CLI for local backend
WEBHOOK_URL=http://host.docker.internal:8080/webhooks/stripe docker-compose up stripe-cli -d

# 3. Get the generated webhook secret
cat ./shared/webhook_secret.txt

# 4. Set environment and start your local backend
export STRIPE_WEBHOOK_SECRET=$(cat ./shared/webhook_secret.txt)
cd DVINE-MVP/backend/DVINE-EXPERIENCE
./mvnw spring-boot:run
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEBHOOK_URL` | Target URL for webhook forwarding | `http://backend:8080/webhooks/stripe` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification secret | Generated dynamically |
| `STRIPE_SECRET_KEY` | Your Stripe API secret key | Pre-configured in docker-compose |

### Webhook Endpoint

Your backend exposes the webhook endpoint at:
- **Docker**: `http://backend:8080/webhooks/stripe`
- **Local**: `http://localhost:8080/webhooks/stripe`

## 🧪 Testing Webhooks

### Trigger Test Events

```bash
# Basic payment success test
docker run --rm --network dvine_dvine-network stripe/stripe-cli:latest \
  trigger payment_intent.succeeded \
  --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv

# Test checkout session completion
docker run --rm --network dvine_dvine-network stripe/stripe-cli:latest \
  trigger checkout.session.completed \
  --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv

# Test payment failure
docker run --rm --network dvine_dvine-network stripe/stripe-cli:latest \
  trigger payment_intent.payment_failed \
  --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv
```

### For Local Backend Testing

```bash
# Trigger events for local backend (port 8080)
docker run --rm stripe/stripe-cli:latest \
  trigger payment_intent.succeeded \
  --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv
```

## 📊 Monitoring

### Check Service Status

```bash
# View all running services
docker-compose ps

# Check Stripe CLI logs
docker-compose logs stripe-cli

# Check backend webhook processing
docker-compose logs backend | grep -i webhook
```

### Webhook Event Logs

Look for these log patterns in your backend:

```
✅ Successfully processed Stripe webhook event: payment_intent.succeeded
🔑 Generated webhook secret: whsec_f578b5d873b0e9ff3821b9c29b27180c19034b670fa5ed1150a29e24e535395e
📡 Forwarding to: http://backend:8080/webhooks/stripe
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Stripe CLI Disconnects
**Symptoms**: Container exits after a few seconds
```bash
# Check logs for errors
docker-compose logs stripe-cli

# Restart the service
docker-compose restart stripe-cli
```

#### 2. Webhook Secret Empty
**Symptoms**: `webhookSecret:` shows empty in logs
```bash
# Check if environment variable is set
docker-compose exec backend env | grep STRIPE_WEBHOOK_SECRET

# Use dynamic startup script
./start-with-dynamic-webhook.sh
```

#### 3. Backend Not Receiving Webhooks
**Symptoms**: No webhook logs in backend
```bash
# Verify Stripe CLI is forwarding to correct URL
docker-compose logs stripe-cli | grep "Forwarding to"

# Check if backend service is running
docker-compose ps backend

# Test with curl
curl -X POST http://localhost:8080/webhooks/stripe -d "test"
```

#### 4. Signature Verification Fails
**Symptoms**: `SignatureVerificationException` in logs
```bash
# Ensure webhook secret matches between Stripe CLI and backend
docker-compose logs stripe-cli | grep "webhook signing secret"
docker-compose exec backend env | grep STRIPE_WEBHOOK_SECRET

# Restart with dynamic secrets
./start-with-dynamic-webhook.sh
```

### Debug Commands

```bash
# Get current webhook secret from Stripe CLI
docker-compose logs stripe-cli | grep "whsec_"

# Check backend environment
docker-compose exec backend env | grep STRIPE

# View recent webhook attempts
docker-compose logs backend --tail 50 | grep webhook

# Test network connectivity
docker-compose exec stripe-cli ping backend
```

## 🏗️ Architecture

### Service Dependencies

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Stripe CLI    │───▶│    Backend      │───▶│    Database     │
│  (Webhooks)     │    │   (Spring)      │    │    (MySQL)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────▶│     Redis       │◀─────────────┘
                        │   (Sessions)    │
                        └─────────────────┘
```

### Webhook Flow

1. **Stripe CLI** listens for events from Stripe servers
2. **Event received** → CLI forwards to backend webhook endpoint
3. **Backend processes** → Verifies signature using webhook secret
4. **Business logic** → Updates database, sends notifications, etc.
5. **Response sent** → Back to Stripe via CLI

## 📝 Development Workflows

### Daily Development

```bash
# Start everything for development
./stripe-webhook-setup.sh

# Work on your code...

# Test a specific webhook
docker run --rm --network dvine_dvine-network stripe/stripe-cli:latest \
  trigger payment_intent.succeeded --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv

# Stop everything when done
docker-compose down
```

### Backend-Only Development

```bash
# Start infrastructure only
docker-compose up db redis -d

# Start Stripe CLI for local backend
WEBHOOK_URL=http://host.docker.internal:8080/webhooks/stripe \
  docker-compose up stripe-cli -d

# Get webhook secret
cat ./shared/webhook_secret.txt

# Set environment and start local backend
export STRIPE_WEBHOOK_SECRET=$(cat ./shared/webhook_secret.txt)
cd DVINE-MVP/backend/DVINE-EXPERIENCE
./mvnw spring-boot:run
```

### Testing Integration

```bash
# Full integration test
./stripe-webhook-setup.sh

# Wait for services to start
sleep 30

# Run test suite
docker run --rm --network dvine_dvine-network stripe/stripe-cli:latest \
  trigger payment_intent.succeeded --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv

# Check logs
docker-compose logs backend | tail -20
```

## 🔐 Security Notes

- **API Keys**: Never commit real Stripe API keys to version control
- **Webhook Secrets**: Use dynamic generation in production
- **Network Access**: Stripe CLI container only has network access to backend
- **Environment Variables**: Webhook secrets are passed securely via environment

## 📚 Additional Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [Spring Boot Configuration](https://spring.io/guides/gs/spring-boot/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start with dynamic webhooks | `./stripe-webhook-setup.sh` |
| Start all services | `docker-compose up --build` |
| Start infrastructure only | `docker-compose up db redis -d` |
| Trigger payment success | `docker run --rm --network dvine_dvine-network stripe/stripe-cli:latest trigger payment_intent.succeeded --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv` |
| Check webhook logs | `docker-compose logs backend \| grep webhook` |
| Get webhook secret | `cat ./shared/webhook_secret.txt` |
| Stop all services | `docker-compose down` |