const SubmitTokenRefresh = async (refreshToken) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            refreshToken: refreshToken
        })
    });
    return response;
}

export default SubmitTokenRefresh; 