# DVINE Project Docker Quick Start Guide

Launch both frontend, backend and database services with one command.

## Prerequisites

- Docker
- Docker Compose

## Port

- Backend: 8080
- Frontend: 5173
- Database: 3306

## Quick Start

Run the following commands in the project root directory:

```bash
# Build and start all services
docker-compose up --build

## Access Applications
- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8080
