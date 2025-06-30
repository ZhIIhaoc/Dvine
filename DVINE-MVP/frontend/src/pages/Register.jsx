import React from "react";
import PropTypes from "prop-types";
import { Grid, Box, Typography, TextField, Button, Link } from "@mui/material";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import SignUpStepOne from "../components/SignUpStepOne.jsx";
import SignUpStepTwo from "../components/SignUpStepTwo.jsx";
import MessageAlert from "../components/MessageAlert.jsx";
import SubmitRegistration from "../endpoints/SubmitRegistration.js";

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
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");
    const [snackbarSeverity, setSnackbarSeverity] = React.useState("info");
    const navigate = useNavigate();

    function getWindowSize() {
        const { innerWidth, innerHeight } = window;
        return { innerWidth, innerHeight };
    }

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

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // this tracks what process of the register process the user is on
    const pageNext = () => setPage(1);
    const pageBack = () => setPage(0);
    const changeState = (value) => (event) => {
        setUsersInfo({
            ...userInfo,
            [value]: event.target.value,
        });
    }

    const registerButton = async () => {
        if (userInfo.email === "" || userInfo.password === "" || userInfo.confirmPassword === "" ) {
            showSnackbar("Please fill in all fields", "warning");
            return;
        }
        if (userInfo.password !== userInfo.confirmPassword) {
            showSnackbar("Passwords do not match", "error");
            return;
        }
        
        try {
            const response = await SubmitRegistration(
                userInfo.email,
                userInfo.phone,
                userInfo.password,
                userInfo.postcode,
                userInfo.firstName,
                userInfo.lastName
            );
            const responseInfo = await response.json();
            console.log(responseInfo);
            
            if (responseInfo.code === 0) {
                // Success case
                const { accessToken, refreshToken } = responseInfo.data || {};
                if (accessToken && refreshToken) {
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);
                    localStorage.setItem("Email", userInfo.email);
                    // props.setToken(accessToken);
                    showSnackbar("Registration successful", "success");
                    navigate("/");
                } else {
                    showSnackbar("Registration response error: token missing", "error");
                }
            } else {
                // Error case
                showSnackbar(responseInfo.msg || "Registration failed", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showSnackbar("Network error. Please try again.", "error");
        }
    };

    return (
        <Grid container sx={{ height: "100vh", overflow: "hidden" }}>
            {/* left side of the page */}
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
                    {/* Multi-step registration implementation */}
                    {page === 0 ? (
                        <SignUpStepOne
                            userInfo={userInfo}
                            changeState={changeState}
                            pageNext={pageNext}
                        />
                    ) : (
                        <SignUpStepTwo
                            userInfo={userInfo}
                            changeState={changeState}
                            pageBack={pageBack}
                            registerButton={registerButton}
                        />
                    )}

                    {/* Single Page Register Code (Commented) */}
                    {/*
                    <Typography variant="h4" sx={{ mb: 2 }}>
                        Create Account
                    </Typography>
                    <TextField
                        label="Email"
                        placeholder="example@gmail.com"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userInfo.email}
                        onChange={changeState("email")}
                    />
                    <TextField
                        label="Phone"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userInfo.phone}
                        onChange={changeState("phone")}
                    />
                    <TextField
                        label="Postcode"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userInfo.postcode}
                        onChange={changeState("postcode")}
                    />
                    <TextField
                        label="First Name"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userInfo.firstName}
                        onChange={changeState("firstName")}
                    />
                    <TextField
                        label="Last Name"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userInfo.lastName}
                        onChange={changeState("lastName")}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={userInfo.password}
                        onChange={changeState("password")}
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        sx={{ mb: 3 }}
                        value={userInfo.confirmPassword}
                        onChange={changeState("confirmPassword")}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ bgcolor: "#800080", mb: 2 }}
                        onClick={registerButton}
                    >
                        Register
                    </Button>
                    <Typography variant="body2" align="center">
                        Already have an account?{" "}
                        <Link
                            underline="hover"
                            color="secondary"
                            onClick={() => navigate("/login")}
                        >
                            Log in
                        </Link>
                    </Typography>
                    */}
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
            <MessageAlert
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                severity={snackbarSeverity}
            />
        </Grid>
    );
};

