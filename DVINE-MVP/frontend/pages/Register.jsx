import React from "react";
import PropTypes from "prop-types";
import SubmitRegistration from "../endpoints/SubmitRegistration.js";
import { useNavigate } from "react-router-dom";


const Register = (props) => {
    const [registerEmail, setEmail] = React.useState('');
    const [password, setPassword]  = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [postcode, setPostcode] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');

    const registerButton = async () => {
        // alert("Register button clicked");
        if (password !== confirmPassword) {
            alert("Passwords do not match");
        } else {
            const response = await SubmitRegistration(registerEmail, phone, password, postcode, firstName, lastName);
            const responseInfo = await response.json();
            console.log(responseInfo);
            if (responseInfo.code == 0) {
                alert("Email already registered");
            } else {
                props.setToken(responseInfo.token);
                localStorage.setItem('token', responseInfo.token);
                localStorage.setItem('Email', registerEmail);
                alert("Registration successful");
                navigate('/');
            }
        };
    }
    return (
        <>
            <h1>Register</h1>
            Email <input id="emailRegister" type="text" onChange={(event) => setEmail(event.target.value)} value={registerEmail} /> <br />
            phone <input id="phoneRegister" type="text" onChange={(event) => setPhone(event.target.value)} value={phone} /> <br />
            postcode <input id="postcodeRegister" type="text" onChange={(event) => setPostcode(event.target.value)} value={postcode} /> <br />
            First Name <input id="firstNameRegister" type="text" onChange={(event) => setFirstName(event.target.value)} value={firstName} /> <br />
            Last Name <input id="lastNameRegister" type="text" onChange={(event) => setLastName(event.target.value)} value={lastName} /> <br />
            Password <input id="passwordRegister" type="password" onChange={(event) => setPassword(event.target.value)} value={password} /> <br />
            Confirm Password <input id="confirmPasswordRegister" type="password" onChange={(event) => setConfirmPassword(event.target.value)} value={confirmPassword} /><br />
            <button id="registerButton" onClick={registerButton}>Register</button>
        </>
    );
   
};

export default Register;

Register.propTypes = {
    setToken: PropTypes.func,
};