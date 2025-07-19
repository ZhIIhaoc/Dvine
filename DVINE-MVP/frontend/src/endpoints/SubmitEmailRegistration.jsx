const SubmitEmailRegistration = async (email) => {
    const localHost = "http://localhost:8080"
    const response = await fetch(`${localHost}/auth/send-verification-code?email=${email}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
    });
    return response;
}

export default SubmitEmailRegistration;

