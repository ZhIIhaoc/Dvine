# DVINE API Swagger Documentation Usage Guide

## Overview
The DVINE Experience API uses OpenAPI 3.1.0 specification for API documentation. The Swagger file is located at:
```
DVINE-MVP/backend/DVINE-EXPERIENCE/DVINE-API/src/main/resources/static/OpenAPI.yaml
```

## How to Launch Swagger UI

### 1. Start the Backend Server
First, ensure your Spring Boot backend is running(or updated docker image):

```bash
cd DVINE-MVP/backend/DVINE-EXPERIENCE/
./mvnw spring-boot:run
```

The server will start on port 8080.

### 2. Access Swagger UI
Once the server is running, access the Swagger UI at:
```
http://localhost:8080/swagger-ui/index.html
```

Alternatively, you can view the raw OpenAPI specification at:
```
http://localhost:8080/OpenAPI.yaml
```

## Authorization Setup

The API uses JWT Bearer token authentication. Here's how to authorize requests:

### 1. Register or Login
Before making authenticated requests, you need to obtain a JWT token:

#### Register a new user:
```bash
POST /auth/register
{
  "email": "john.doe@example.com",
  "phone": "+61412345678",
  "password": "SecurePassword123!",
  "postcode": "2000",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login with existing credentials:
```bash
POST /auth/login
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

Both endpoints return a response with `accessToken` and `refreshToken`:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Configure Authorization in Swagger UI

1. **Click the "Authorize" button** at the top of the Swagger UI page
2. **Enter your token** in the "Value" field using this format:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Replace the token with your actual `accessToken`)
3. **Click "Authorize"** to save the token
4. **Click "Close"** to return to the API documentation

### 3. Using Authorization Headers Manually
If using curl or other tools, include the Authorization header:
```bash
curl -X GET "http://localhost:8080/users/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Permission Levels

The API has different permission levels:
- **0**: Regular User
- **1**: Partner (can create/modify own tours)
- **4**: Manager (can manage catalogues and approve tours)

## Common Endpoints

### Public Endpoints (No Authentication Required)
- `GET /catalogues/list` - Get all catalogues
- `GET /catalogues/{catalogueId}` - Get specific catalogue
- `GET /tours` - Search/filter tours
- `GET /tours/{tourId}` - Get specific tour
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Authenticated Endpoints
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token

### Partner Level Required (Permission ≥ 1)
- `POST /tours` - Create new tour (automatically assigned to creator)
- `PUT /tours` - Update tour (only tours created by current partner)
- `DELETE /tours` - Delete tour (only tours created by current partner)
- `GET /approvals/my-submissions` - View own submissions

**Note**: Partners can only modify tours they created. For unauthorized access attempts, you'll receive:
```json
{
  "code": 1,
  "msg": "Partner can only modify the tour created by themselves"
}
```

### Manager Level Required (Permission ≥ 4)
- `POST /catalogues` - Create catalogue
- `PUT /catalogues` - Update catalogue  
- `DELETE /catalogues` - Delete catalogue
- `GET /users/list` - Get all users
- `GET /approvals/pending-tours` - View pending tours
- `POST /approvals/tours/{pendingTourId}/approve` - Approve tour
- `POST /approvals/tours/{pendingTourId}/reject` - Reject tour

**Note**: Managers can modify ANY tour regardless of creator (administrative override).

## Token Refresh

When your access token expires, use the refresh token:
```bash
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

This returns new access and refresh tokens.

## Server Endpoints

The API documentation supports two server environments:
- **Development**: `http://localhost:8080`
- **Production**: `https://api.dvine.com`

Select the appropriate server in the Swagger UI dropdown.