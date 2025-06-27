const SubmitRegistration = async (registerEmail, phone, password, postcode, firstName, lastName) => {
    const localHost = "http://localhost:8080/"
    const response = await fetch(`${localHost}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: registerEmail,
            phone: phone,
            password: password,
            postcode: postcode,
            firstName: firstName,
            lastName: lastName,
        })
    });
    alert("???");
    return response;
}


export default SubmitRegistration;

