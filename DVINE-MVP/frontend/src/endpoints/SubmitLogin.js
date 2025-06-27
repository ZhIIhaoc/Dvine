const SubmitLogin = async (email, password) => {
    const localHost = "http://localhost:8080/";
    const response = await fetch(`${localHost}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password,
        })
    });
    return response;
}

export default SubmitLogin;