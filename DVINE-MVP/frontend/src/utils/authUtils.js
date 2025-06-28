import SubmitLogout from '../endpoints/SubmitLogout.js';
import SubmitTokenRefresh from '../endpoints/SubmitTokenRefresh.js';

export const logout = async (setToken, navigate, showSnackbar) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const response = await SubmitLogout(setToken, navigate, showSnackbar);
            const responseInfo = await response.json();
            
            if (responseInfo.code === 0) {
                // Clear all stored data
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('Email');
                setToken(null);
                showSnackbar('Logout successful', 'success');
                navigate('/login');
            } else {
                showSnackbar(responseInfo.msg || 'Logout failed', 'error');
            }
        } else {
            // No token found, just clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('Email');
            setToken(null);
            showSnackbar('Logged out', 'info');
            navigate('/login');
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Even if logout API fails, clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('Email');
        setToken(null);
        showSnackbar('Logged out', 'info');
        navigate('/login');
    }
};

export const isAuthenticated = () => {
    const accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
};

export const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

/**
 * handle 401 response, try to refresh token
 * @param {Function} setToken - function to set token
 * @param {Function} navigate - navigation function
 * @param {Function} showSnackbar - function to show snackbar
 * @returns {Promise<boolean>} - return if refresh is successful
 */
export const handle401Response = async (setToken, navigate, showSnackbar) => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
        console.log('No refresh token found, redirecting to login');
        await forceLogout(setToken, navigate, showSnackbar, 'Session expired. Please login again.');
        return false;
    }

    try {
        console.log('Attempting to refresh tokens');
        const response = await SubmitTokenRefresh(refreshToken);
        const responseInfo = await response.json();

        if (responseInfo.code === 0) {
            // refresh successful
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = responseInfo.data || {};
            if (newAccessToken && newRefreshToken) {
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                setToken(newAccessToken);
                console.log('Tokens refreshed successfully');
                return true;
            } else {
                console.log('Token refresh response missing tokens');
                await forceLogout(setToken, navigate, showSnackbar, 'Token refresh failed. Please login again.');
                return false;
            }
        } else {
            console.log('Token refresh failed:', responseInfo.msg);
            await forceLogout(setToken, navigate, showSnackbar, responseInfo.msg || 'Token refresh failed. Please login again.');
            return false;
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        await forceLogout(setToken, navigate, showSnackbar, 'Network error during token refresh. Please login again.');
        return false;
    }
};

/**
 * force logout (clear all data and redirect to login page)
 * @param {Function} setToken - function to set token
 * @param {Function} navigate - navigation function
 * @param {Function} showSnackbar - function to show snackbar
 * @param {string} message - message to show
 */
export const forceLogout = async (setToken, navigate, showSnackbar, message = 'Session expired') => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('Email');
    setToken(null);
    showSnackbar(message, 'warning');
    navigate('/login');
}; 