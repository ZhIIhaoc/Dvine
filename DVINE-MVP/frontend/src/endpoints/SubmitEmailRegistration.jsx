const SubmitEmailRegistration = async (email) => {
    const localHost = "http://localhost:8080"
    const response = await fetch(`${localHost}/auth/send-verification-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            },
        body: JSON.stringify({ email }),
    });
    return response;
}

export default SubmitEmailRegistration;

