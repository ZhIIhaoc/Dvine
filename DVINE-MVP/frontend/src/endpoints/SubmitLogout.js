const SubmitLogout = async (setToken, navigate, showSnackbar) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export default SubmitLogout; 