const SubmitLogout = async (accessToken) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response;
}

export default SubmitLogout; 