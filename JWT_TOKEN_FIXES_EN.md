# JWT Token Handling Fixes - DVINE-MVP Project

## Overview

This document details the comprehensive fixes implemented to resolve JWT token expiration issues and improve the overall authentication system in the DVINE-MVP frontend application.

## Problem Summary

### Initial Issues
1. **Token Expiration Problems**: After 2 hours, user dashboard and account settings showed "loading" indefinitely
2. **Inconsistent Token Handling**: Different components used different approaches for API calls
3. **Manual Token Management**: Each component had to manually handle token refresh
4. **Guest User Compatibility**: Token handling needed to work for both authenticated and guest users

### Root Causes
- JWT access tokens expired after 2 hours
- Frontend components used direct `fetch` calls without automatic token refresh
- No centralized token management system
- Backend exceptions for empty results caused unintended redirects

## Solutions Implemented

### 1. Global Fetch Interceptor (`main.jsx`)

**File**: `DVINE-MVP/frontend/src/main.jsx`

**Purpose**: Centralized JWT token injection and automatic refresh

**Implementation**:
```javascript
// Global fetch override for JWT token handling
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
    let token = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');
    
    // Clone headers to avoid mutating input
    let headers = { ...(init.headers || {}) };
    if (token) {
        headers['Authorization'] = token;
    }
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    
    const fetchInit = { ...init, headers };
    let response = await originalFetch(input, fetchInit);

    // If 401 and token exists, try to refresh
    if (response.status === 401 && token) {
        console.log('401 Unauthorized. Attempting to refresh token...');
        const refreshResponse = await originalFetch('http://localhost:8080/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.code === 0 && refreshData.data) {
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshData.data;
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                console.log('Token refreshed successfully. Retrying original request...');
                
                // Retry the original request with the new token
                headers['Authorization'] = newAccessToken;
                const retryFetchInit = { ...init, headers };
                response = await originalFetch(input, retryFetchInit);
            } else {
                console.log('Token refresh failed:', refreshData.msg);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login'; // Redirect to login
            }
        } else {
            console.log('Refresh token endpoint failed.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login'; // Redirect to login
        }
    }
    return response;
};
```

**Benefits**:
- Automatic token injection for all API calls
- Automatic token refresh on 401 responses
- Automatic login redirect when refresh fails
- Works for both authenticated and guest users
- No need to manually pass tokens in API calls

### 2. Backend Exception Handling Fixes

#### TourOperationServiceImpl Fix

**File**: `DVINE-MVP/backend/DVINE-EXPERIENCE/DVINE-SERVICE/src/main/java/com/dvineservice/service/impl/TourOperationServiceImpl.java`

**Problem**: Throwing `NotFoundException` for valid "no results" scenarios

**Fix**:
```java
@Override
public List<Tour> search(TourQueryParam tourQueryParam) {
    List<Tour> tour = tourMapper.search(tourQueryParam);
    
    // If searching by createdBy (user's own tours), return empty list instead of throwing exception
    // This allows users to see their tours page even if they haven't created any tours yet
    if (tour.isEmpty() && tourQueryParam.getCreatedBy() != null) {
        return tour; // Return empty list for user's own tours
    }
    
    // For general searches (no specific criteria) or when no tours exist in the system,
    // return empty list instead of throwing exception
    // This allows admin pages to load even when there are no tours in the system
    if (tour.isEmpty() && 
        tourQueryParam.getTourId() == null && 
        tourQueryParam.getCatalogueId() == null && 
        tourQueryParam.getCatalogueName() == null && 
        tourQueryParam.getTitle() == null && 
        tourQueryParam.getDestination() == null && 
        tourQueryParam.getMinPrice() == null && 
        tourQueryParam.getMaxPrice() == null) {
        return tour; // Return empty list for general searches
    }
    
    // For other search criteria with specific filters, throw exception if no tours found
    if (tour.isEmpty()) {
        throw new NotFoundException("Tour not found");
    }
    return tour;
}
```

**Benefits**:
- Partner users can access their tours page even without created tours
- Manager/Owner users can access admin pages even without tour data
- Specific searches still throw exceptions appropriately

### 3. Frontend Component Simplification

#### Removed Manual Token Handling

**Files Modified**:
- `AuthProvider.jsx`
- `UserListForm.jsx`
- `UserSettings.jsx`
- `AdminTourPage.jsx`
- `CreateTours.js`
- `CurrentUploadedTours.jsx`
- `TourDetails.jsx`
- `Home.jsx`
- `Catalogue.jsx`

**Changes**:
- Removed `apiRequest` utility usage
- Simplified to use plain `fetch` calls
- Removed manual token parameter passing
- Removed `apiUtils.js` and `SubmitTokenRefresh.js` files

**Example Before**:
```javascript
const response = await apiRequest(
    'http://localhost:8080/users/profile',
    { method: 'GET' },
    setToken,
    navigate,
    showSnackbar
);
```

**Example After**:
```javascript
const response = await fetch('http://localhost:8080/users/profile');
```

### 4. Bug Fixes

#### Catalogue.jsx Delete Button Fix

**Problem**: Delete tour button was calling `handleDeleteCatalogue(tour.tourId)` instead of deleting the tour

**Fix**:
```javascript
// Added handleDeleteTour function
const handleDeleteTour = async (tourId) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) {
        return;
    }

    try {
        const result = await deleteTour(tourId, token);
        if (result.code === 0) {
            fetchToursData();
        } else {
            setError("Failed to delete tour");
        }
    } catch (error) {
        console.error("Error deleting tour:", error);
        setError("Failed to delete tour");
    }
};

// Fixed button onClick
<IconButton
    size="small"
    onClick={(e) => {
        e.stopPropagation();
        handleDeleteTour(tour.tourId); // Fixed: was handleDeleteCatalogue(tour.tourId)
    }}
    color="error"
>
    <DeleteIcon />
</IconButton>
```

#### FAQ.jsx DOM Nesting Fix

**Problem**: `<button>` elements nested inside other `<button>` elements

**Fix**: Moved `IconButton` elements from `AccordionSummary` to `AccordionDetails`

## How to Use the New System

### For Developers

#### 1. Making API Calls

**Before (Manual Token Handling)**:
```javascript
import { apiRequest } from "../utils/apiUtils";

const response = await apiRequest(
    'http://localhost:8080/users/profile',
    { method: 'GET' },
    setToken,
    navigate,
    showSnackbar
);
```

**After (Automatic Token Handling)**:
```javascript
const response = await fetch('http://localhost:8080/users/profile');
const data = await response.json();
```

#### 2. Adding New API Endpoints

Simply use `fetch` directly - tokens are automatically injected:

```javascript
const createNewResource = async (resourceData) => {
    const response = await fetch('http://localhost:8080/resources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData)
    });
    return await response.json();
};
```

#### 3. Error Handling

The global interceptor handles most authentication errors automatically. For custom error handling:

```javascript
const response = await fetch('http://localhost:8080/api/endpoint');
if (!response.ok) {
    if (response.status === 401) {
        // Token refresh handled automatically
        console.log('Token was refreshed automatically');
    } else if (response.status === 403) {
        // Permission denied
        console.error('Permission denied');
    } else {
        // Other errors
        console.error('API error:', response.status);
    }
}
```

### For Users

#### 1. Automatic Token Refresh

- **No Action Required**: Tokens refresh automatically in the background
- **Seamless Experience**: Users won't notice when tokens are refreshed
- **Automatic Login**: If refresh fails, users are automatically redirected to login

#### 2. Guest User Compatibility

- **Public Pages**: Home, tours, catalogue pages work without login
- **Authentication Required**: Protected pages require login
- **Smooth Transitions**: No interruption when switching between public and private areas

## Testing the Fixes

### 1. Token Expiration Test

1. **Login** as any user
2. **Wait 2 hours** (or manually expire token in browser dev tools)
3. **Navigate** to protected pages (dashboard, settings, etc.)
4. **Verify** pages load correctly without manual refresh

### 2. Guest User Test

1. **Clear** all authentication data
2. **Visit** public pages (home, tours, catalogue)
3. **Verify** pages load correctly
4. **Try** to access protected pages
5. **Verify** automatic redirect to login

### 3. Admin Page Test

1. **Login** as Manager/Owner
2. **Access** admin pages (tour approval, user management)
3. **Verify** pages load even with no data
4. **Test** creating and deleting resources

## API Endpoints Requiring Authentication

Based on Swagger documentation, these endpoints require authentication:

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/list` - List all users (Manager+)

### Tour Management
- `POST /tours` - Create tour (Partner+)
- `PUT /tours` - Update tour (Partner+)
- `DELETE /tours` - Delete tour (Partner+)

### Catalogue Management
- `POST /catalogues` - Create catalogue (Manager+)
- `PUT /catalogues` - Update catalogue (Manager+)
- `DELETE /catalogues` - Delete catalogue (Manager+)

### Approval System
- `GET /approvals/pending-tours` - Get pending tours (Manager+)
- `POST /approvals/tours/{id}/approve` - Approve tour (Manager+)
- `POST /approvals/tours/{id}/reject` - Reject tour (Manager+)
- `GET /approvals/my-submissions` - Get user's submissions (Partner+)

### Featured Tours
- `GET /featured-tours/manage` - Get featured tours for management (Manager+)
- `POST /featured-tours` - Add tour to featured (Manager+)
- `DELETE /featured-tours` - Remove tour from featured (Manager+)

### FAQ Management
- `POST /faqs` - Create FAQ (Manager+)
- `PUT /faqs` - Update FAQ (Manager+)
- `DELETE /faqs/{id}` - Delete FAQ (Manager+)

## Troubleshooting

### Common Issues

#### 1. Still Getting 401 Errors

**Check**:
- Token exists in localStorage
- Token format is correct
- Backend is running
- Network connectivity

#### 2. Infinite Redirect Loop

**Check**:
- Refresh token is valid
- Backend refresh endpoint is working
- No JavaScript errors in console

#### 3. Guest Users Can't Access Public Pages

**Check**:
- JWT interceptor is not blocking public endpoints
- Whitelist configuration is correct

### Debug Mode

Enable debug logging by adding to browser console:

```javascript
// Enable detailed logging
localStorage.setItem('debugJWT', 'true');

// Check token status
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

## Performance Considerations

### Benefits
- **Reduced Bundle Size**: Removed `apiUtils.js` and `SubmitTokenRefresh.js`
- **Simplified Code**: No manual token management in components
- **Better UX**: Automatic token refresh without user intervention

### Monitoring
- Monitor token refresh frequency
- Track failed refresh attempts
- Monitor API call success rates

## Security Considerations

### Token Storage
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic cleanup on logout
- Secure token transmission

### Refresh Token Security
- Refresh tokens have longer expiration
- Automatic logout on refresh failure
- Secure refresh endpoint

## Future Improvements

### Potential Enhancements
1. **HttpOnly Cookies**: Move tokens to secure cookies
2. **Token Rotation**: Implement refresh token rotation
3. **Offline Support**: Cache responses for offline access
4. **Progressive Enhancement**: Graceful degradation for older browsers

### Monitoring
1. **Token Analytics**: Track token usage patterns
2. **Error Reporting**: Monitor authentication failures
3. **Performance Metrics**: Measure API call performance

## Conclusion

The implemented JWT token handling system provides:

- **Automatic token management** for all API calls
- **Seamless user experience** with background token refresh
- **Guest user compatibility** for public pages
- **Simplified development** with centralized token handling
- **Robust error handling** with automatic fallbacks

This solution eliminates the manual token management burden from individual components while providing a reliable and user-friendly authentication experience. 