const SubmitForgottenPasswordRequest = async (email) => {
    const localHost = "http://localhost:8080"
    const response = await fetch(`${localHost}/auth/send-password-reset-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            },
        body: JSON.stringify({ email }),
    });
    return response;
}

export default SubmitForgottenPasswordRequest;