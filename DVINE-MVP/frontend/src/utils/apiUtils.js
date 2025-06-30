import { handle401Response } from './authUtils.js';

/**
 * API request function with 401 handling
 * @param {string} url - request URL
 * @param {Object} options - request options
 * @param {Function} setToken - function to set token
 * @param {Function} navigate - navigation function
 * @param {Function} showSnackbar - function to show snackbar
 * @returns {Promise<Response>} - response object
 */
export const apiRequest = async (url, options = {}, setToken, navigate, showSnackbar) => {
    const {
        method = 'GET',
        headers = {},
        body,
        requireAuth = true,
        ...otherOptions
    } = options;

    // build request headers
    const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    // if need auth, add access token
    if (requireAuth) {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            requestHeaders['Authorization'] = accessToken;
        }
    }

    // build request options
    const requestOptions = {
        method,
        headers: requestHeaders,
        ...otherOptions
    };

    // if have body, add to request
    if (body) {
        requestOptions.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, requestOptions);
        
        // if response is 401, try to refresh token and retry
        if (response.status === 401 && requireAuth) {
            console.log('Received 401, attempting token refresh');
            const refreshSuccess = await handle401Response(setToken, navigate, showSnackbar);
            
            if (refreshSuccess) {
                // use new token to retry request
                const newAccessToken = localStorage.getItem('accessToken');
                requestHeaders['Authorization'] = newAccessToken;
                const retryResponse = await fetch(url, {
                    ...requestOptions,
                    headers: requestHeaders
                });
                return retryResponse;
            } else {
                // refresh failed, throw error
                throw new Error('Authentication failed after token refresh');
            }
        }
        
        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

/**
 * GET request
 * @param {string} url - request URL
 * @param {Object} options - request options
 * @param {Function} setToken - function to set token
 * @param {Function} navigate - navigation function
 * @param {Function} showSnackbar - function to show snackbar
 * @returns {Promise<Response>} - response object
 */
export const apiGet = (url, options = {}, setToken, navigate, showSnackbar) => {
    return apiRequest(url, { method: 'GET', ...options }, setToken, navigate, showSnackbar);
};

/**
 * POST request
 * @param {string} url - request URL
 * @param {Object} body - request body
 * @param {Object} options - request options
 * @param {Function} setToken - function to set token
 * @param {Function} navigate - navigation function
 * @param {Function} showSnackbar - function to show snackbar
 * @returns {Promise<Response>} - response object
 */
export const apiPost = (url, body, options = {}, setToken, navigate, showSnackbar) => {
    return apiRequest(url, { method: 'POST', body, ...options }, setToken, navigate, showSnackbar);
};

/**
 * PUT request
 * @param {string} url - request URL
 * @param {Object} body - request body
 * @param {Object} options - request options
 * @param {Function} setToken - function to set token
 * @param {Function} navigate - navigation function
 * @param {Function} showSnackbar - function to show snackbar
 * @returns {Promise<Response>} - response object
 */
export const apiPut = (url, body, options = {}, setToken, navigate, showSnackbar) => {
    return apiRequest(url, { method: 'PUT', body, ...options }, setToken, navigate, showSnackbar);
};

/**
 * DELETE request
 * @param {string} url - request URL
 * @param {Object} options - request options
 * @param {Function} setToken - function to set token
 * @param {Function} navigate - navigation function
 * @param {Function} showSnackbar - function to show snackbar
 * @returns {Promise<Response>} - response object
 */
export const apiDelete = (url, options = {}, setToken, navigate, showSnackbar) => {
    return apiRequest(url, { method: 'DELETE', ...options }, setToken, navigate, showSnackbar);
};

/**
 * handle API response
 * @param {Response} response - response object
 * @returns {Promise<Object>} - parsed response data
 */
export const handleApiResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { msg: errorText };
        }
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    
    return await response.text();
}; 