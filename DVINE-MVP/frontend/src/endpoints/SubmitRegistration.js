import React, { useState } from "react";
const SubmitRegistration = async (
    registerEmail,
    phone,
    password,
    postcode,
    firstName,
    lastName,
    verificationCode,
    role
) => {
    const localHost = "http://localhost:8080";
    let roleNumber = 0; // Default role is user
    if (role === "partner") {
        roleNumber = 2; // Set to partner role
    }
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
                permission: roleNumber,
            },
            verificationCode: verificationCode,
        }),
    });

    return response;
};

export default SubmitRegistration;