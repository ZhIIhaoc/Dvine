import React from "react";
import PropTypes from "prop-types";
import SubmitRegistration from "../endpoints/SubmitRegistration.js";
import { useNavigate } from "react-router-dom";
import { Grid, Box } from "@mui/material";
import Logo from "../components/Logo.jsx";
import SignUpStepOne from "../components/SignUpStepOne.jsx";
import SignUpStepTwo from "../components/SignUpStepTwo.jsx";

export const Register = () => {
    const [page, setPage] = React.useState(0);
    const [windowSize, setWindowSize] = React.useState(getWindowSize());
    const [userInfo, setUsersInfo] = React.useState({
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        postcode: "",
        firstName: "",
        lastName: "",
    });
    //const { setToken } = useContext(AuthContext);
    const navigate = useNavigate();
    React.useEffect(() => {
        function handleWindowResize() {
            // console.log(getWindowSize());
            setWindowSize(getWindowSize());
        }

        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
    }, []);

    function getWindowSize() {
        const { innerWidth, innerHeight } = window;
        return { innerWidth, innerHeight };
    }

    // this tracks what process of the register process the user is on
    const pageNext = () => setPage(1);
    const pageBack = () => setPage(0);
    const changeState = (value) => (event) => {
        setUsersInfo({
            ...userInfo,
            [value]: event.target.value,
        });
    };

    const registerButton = async () => {
        alert("Register button clicked");
        if (userInfo.password !== userInfo.confirmPassword) {
            // alert("Passwords do not match");
        } else {
            // alert("???");
            const response = await fetch(
                `http://localhost:8080/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: userInfo.email,
                        phone: userInfo.phone,
                        password: userInfo.password,
                        postcode: userInfo.postcode,
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                    }),
                }
            );
            const responseInfo = await response.json();
            console.log(responseInfo);
            if (responseInfo.code === 1) {
                // alert("Email already registered");
            } else {
                //setToken(responseInfo.data.accessToken);
                localStorage.setItem("token", responseInfo.data.accessToken);
                localStorage.setItem("Email", userInfo.email);
                // alert("Registration successful");
                navigate("/");
            }
        }
    };
    return (
        <Grid container sx={{ height: "100vh", overflow: "hidden" }}>
            <Grid size={windowSize.innerWidth < 900 ? 12 : 6}>
                <Logo />
                <Box
                    sx={{
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    {page === 0 ? (
                        <SignUpStepOne
                            changeState={changeState}
                            userInfo={userInfo}
                            pageNext={pageNext}
                        />
                    ) : (
                        <SignUpStepTwo
                            changeState={changeState}
                            userInfo={userInfo}
                            pageBack={pageBack}
                            registerButton={registerButton}
                        />
                    )}
                </Box>
            </Grid>
            {windowSize.innerWidth >= 900 && (
                <Grid size={6}>
                    <img
                        src="../src/assets/background.png"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                </Grid>
            )}
        </Grid>
    );
};

