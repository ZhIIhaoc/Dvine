import SubmitLogout from '../endpoints/SubmitLogout.js';

export const logout = async (setToken, navigate, showSnackbar) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            const response = await SubmitLogout(accessToken);
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