# DVINE - Wine Tour Experience Platform

A comprehensive platform for discovering and booking wine tours, featuring a React frontend and Spring Boot backend with Stripe payment integration.

## Prerequisites

Before starting, ensure you have the following installed:

### All Platforms:
- **Docker Desktop** (required for containerized deployment)
- **Git** (for cloning the repository)

### Windows-Specific Requirements:
- **Git for Windows** (includes Git Bash for running shell scripts)
- **WSL 2** (recommended for better Docker performance)
- **Docker Desktop with WSL 2 backend enabled**

### Recommended Setup for Windows Users:
1. Install Git for Windows from [git-scm.com](https://git-scm.com)
2. Install Docker Desktop and enable WSL 2 integration
3. Use Git Bash, WSL, or Windows Terminal for command execution

## Installation Manual

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd DVINE
```

### Step 2: Build Docker Images
**Important:** You must build the Docker images before running the application. This is required because:
- The backend service needs to be compiled from Java source code
- The frontend service needs to be built from React/TypeScript source code
- The Stripe webhook setup depends on the backend service being available

```bash
docker-compose build
```

This command will:
- Build the Spring Boot backend from `DVINE-MVP/backend/DVINE-EXPERIENCE/`
- Build the React frontend from `DVINE-MVP/frontend/`
- Pull required images (MySQL, Redis, Stripe CLI)

### Step 3: Start the Application with Stripe Integration

#### For macOS/Linux:
```bash
./stripe-webhook-setup.sh
```

#### For Windows:
**Option 1 - Using Git Bash (Recommended):**
```bash
./stripe-webhook-setup.sh
```

**Option 2 - Using Command Prompt/PowerShell:**
```cmd
docker-compose build
docker-compose up --build
```
*Note: Windows users using Command Prompt will need to manually set the STRIPE_WEBHOOK_SECRET environment variable or use the fallback webhook secret from the configuration file.*

**Option 3 - Using WSL (Windows Subsystem for Linux):**
```bash
./stripe-webhook-setup.sh
```

This script will:
1. Create necessary shared directories
2. Start the Stripe CLI to generate webhook secrets
3. Wait for webhook secret generation (up to 60 seconds)
4. Start all services with the dynamically generated webhook secret
5. Display service status and webhook testing commands

## Services and Ports

Once running, the following services will be available:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React web application |
| Backend API | http://localhost:8080 | Spring Boot REST API |
| MySQL Database | localhost:3306 | Main database |
| Redis | localhost:6379 | Session storage and caching |
| Stripe CLI | N/A | Webhook listener for payment testing |

## Environment Variables and Secrets

### Backend Environment Variables
The following environment variables are automatically configured in `docker-compose.yml`:

```bash
# Spring Boot Configuration
SPRING_PROFILES_ACTIVE=docker
SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/dvine_db
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=1234

# Redis Configuration
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379

# Stripe Configuration (dynamically set by webhook setup script)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Database Configuration
- **Database Name:** `dvine_db`
- **Root Password:** `1234`
- **Initialization:** Database schema and test data are automatically loaded from `DVINE-MVP/db/` on first startup

### Stripe Configuration

**Configuration File:** `DVINE-MVP/backend/DVINE-EXPERIENCE/DVINE-API/src/main/resources/application.yml`

The Stripe settings are configured in the backend's application.yml file:

```yaml
stripe:
  secret:
    key: sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv
  webhook:
    secret: ${STRIPE_WEBHOOK_SECRET:whsec_f578b5d873b0e9ff3821b9c29b27180c19034b670fa5ed1150a29e24e535395e}
  public:
    key: pk_test_51Rm729GfQkMoi85mj5PvXe7k8AmUiMPTEsV6Pnxp3CWzcXc6emlYgQUwoLLa38sjOwqdJlXzI6U7lKKGCWRK9iIq00VLMXP3Tz
```

**Key Details:**
- **Secret API Key:** Used for server-side Stripe API calls
- **Public Key:** Used for client-side Stripe.js integration (We did not use this in the current implementation)
- **Webhook Secret:** Dynamically injected by the webhook setup script (falls back to default if not provided)
- **Webhook Endpoint:** `http://backend:8080/webhooks/stripe`

**To modify Stripe settings:**
1. Edit the `application.yml` file in the backend
2. Update the API keys with your own Stripe test/live keys
3. Rebuild the backend: `docker-compose build backend`
4. Restart the services: `./stripe-webhook-setup.sh`

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:8080
```

## Testing Stripe Webhooks

After the application starts, you can test Stripe webhooks using the provided command:

```bash
docker run --rm --network dvine_dvine-network stripe/stripe-cli:latest trigger payment_intent.succeeded --api-key sk_test_51Rm729GfQkMoi85m3625oChFNXNhgKoeiGpupVUvyDZRfdOzCK3ShhwUB3XW73710JUoVxnXoYusJUF6qG948h1r00BsztoKNv
```

## Stopping the Application

To stop all services:
```bash
docker-compose down
```

To stop and remove all data (including database):
```bash
docker-compose down -v
```

## Troubleshooting

### Common Issues

1. **"Docker is not running" error**
   - **macOS/Linux**: Ensure Docker Desktop is started and running
   - **Windows**: Ensure Docker Desktop is started and WSL 2 backend is enabled
   - Check Docker status with: `docker info`

2. **Webhook secret generation timeout**
   - Check if the backend service is running: `docker-compose logs backend`
   - **macOS/Linux/Git Bash**: Restart the webhook setup: `./stripe-webhook-setup.sh`
   - **Windows CMD/PowerShell**: Use `docker-compose restart` and check logs

3. **Script execution issues (Windows)**
   - **"Permission denied" or script not found**: Use Git Bash or WSL instead of Command Prompt
   - **"./stripe-webhook-setup.sh: No such file or directory"**: Ensure you're in the correct directory and the file has executable permissions
   - **Line ending issues**: If cloned on Windows, run `git config core.autocrlf false` and re-clone

4. **Port conflicts**
   - Ensure ports 3306, 5173, 6379, and 8080 are available
   - **Windows**: Check with `netstat -ano | findstr :8080`
   - **macOS/Linux**: Check with `lsof -i :8080`
   - Stop any conflicting services before starting DVINE

5. **Build failures**
   - Clean Docker build cache: `docker-compose build --no-cache`
   - **Windows**: Ensure file sharing is enabled in Docker Desktop settings
   - Check for file permission issues in shared directories

### Viewing Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs [service-name]
# Examples:
docker-compose logs backend
docker-compose logs frontend
docker-compose logs stripe-cli
```

## Architecture

This application follows a microservice architecture:

- **Frontend:** React 19 + Vite + Material-UI
- **Backend:** Spring Boot 3.4.7 + MyBatis + JWT Authentication
- **Database:** MySQL 8.4 with Redis for session management
- **Payment:** Stripe integration with webhook support
- **Containerization:** Docker Compose for development environment


