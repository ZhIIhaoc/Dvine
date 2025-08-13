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