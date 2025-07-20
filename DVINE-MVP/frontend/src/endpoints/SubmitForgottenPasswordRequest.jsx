const SubmitForgottenPasswordRequest = async (email) => {
    const localHost = "http://localhost:8080"
    const response = await fetch(`${localHost}/auth/send-password-reset-code?email=${email}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            },
    });
    return response;
}

export default SubmitForgottenPasswordRequest;