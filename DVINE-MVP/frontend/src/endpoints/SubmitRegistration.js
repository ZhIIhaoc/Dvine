const SubmitRegistration = async (registerEmail, phone, password, postcode, firstName, lastName) => {
    const response = await fetch('/auth/register', {
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
    return response;
}


export default SubmitRegistration;

