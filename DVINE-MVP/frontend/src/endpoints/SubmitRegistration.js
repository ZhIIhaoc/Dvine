const SubmitRegistration = async (
    registerEmail,
    phone,
    password,
    postcode,
    firstName,
    lastName,
    verificationCode
) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/auth/register-with-verification`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user: {
                email: registerEmail,
                phone: phone,
                password: password,
                postcode: postcode,
                firstName: firstName,
                lastName: lastName,
            },
            verificationCode: verificationCode,
        }),
    });

    return response;
};

export default SubmitRegistration;