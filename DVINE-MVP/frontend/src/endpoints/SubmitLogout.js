import { apiPost } from '../utils/apiUtils.js';

const SubmitLogout = async (setToken, navigate, showSnackbar) => {
    const localHost = "http://localhost:8080";
    const response = await apiPost(
        `${localHost}/auth/logout`,
        {},
        { requireAuth: true },
        setToken,
        navigate,
        showSnackbar
    );
    return response;
}

export default SubmitLogout; 