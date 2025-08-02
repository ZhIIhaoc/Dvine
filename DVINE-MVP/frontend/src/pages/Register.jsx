import React from "react";
import PropTypes from "prop-types";
import { Grid, Box, Typography, TextField, Button, Link } from "@mui/material";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import SignUpStepOne from "../components/SignUpStepOne.jsx";
import SignUpStepTwo from "../components/SignUpStepTwo.jsx";
import SignUpStepThree from "../components/SignUpStepThree.jsx";
import MessageAlert from "../components/MessageAlert.jsx";
import SubmitRegistration from "../endpoints/SubmitRegistration.js";
import SubmitEmailRegistration from "../endpoints/SubmitEmailRegistration.jsx";
import { AuthContext } from "../components/AuthContext.jsx";
import { useContext } from "react";

export const Register = ({ isDarkMode, setIsDarkMode }) => {
    const [page, setPage] = React.useState(0);
    const [windowSize, setWindowSize] = React.useState(getWindowSize());
    const { setToken } = useContext(AuthContext);
    const [userInfo, setUserInfo] = React.useState({
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        postcode: "",
        firstName: "",
        lastName: "",
    });
    const [role, setRole] = React.useState("user"); // Default role
    const [verificationCode, setVerificationCode] = React.useState("");
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
    const pageNext = () => setPage((prevPage) => prevPage + 1);
    const pageBack = () => setPage((prevPage) => prevPage - 1);
    const changeState = (value) => (event) => {
        setUserInfo({
            ...userInfo,
            [value]: event.target.value,
        });
    };

    const confirmEmail = async () => {
        if (
            userInfo.email === "" ||
            userInfo.password === "" ||
            userInfo.confirmPassword === ""
        ) {
            showSnackbar("Please fill in all fields", "warning");
            return;
        }
        if (userInfo.password !== userInfo.confirmPassword) {
            showSnackbar("Passwords do not match", "error");
            return;
        }
        try {
            const response = await SubmitEmailRegistration(userInfo.email);
            const responseInfo = await response.json();
            console.log(responseInfo, "Email confirmation response");

            if (responseInfo.code === 0) {
                // Success case
                showSnackbar("Verification email sent", "success");
                pageNext(); // Move to the next step
            } else {
                // Error case
                showSnackbar(
                    responseInfo.msg || "Failed to send verification email",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error sending verification email:", error);
            showSnackbar("Network error. Please try again.", "error");
        }
    };
    const resendCode = async () => {
        try {
            const response = await SubmitEmailRegistration(userInfo.email);
            const responseInfo = await response.json();
            console.log("Resend response:", responseInfo);

            if (responseInfo.code === 0) {
                showSnackbar("Verification email resent", "success");
            } else {
                showSnackbar(
                    responseInfo.msg || "Failed to resend verification email",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error resending email:", error);
            showSnackbar("Network error. Please try again.", "error");
        }
    };
    const registerButton = async () => {
        if (
            userInfo.email === "" ||
            userInfo.password === "" ||
            userInfo.confirmPassword === ""
        ) {
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
                userInfo.lastName,
                verificationCode,
                role
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
                    setToken(accessToken);

                    showSnackbar("Registration successful", "success");
                    navigate("/");
                } else {
                    showSnackbar(
                        "Registration response error: token missing",
                        "error"
                    );
                }
            } else {
                // Error case
                showSnackbar(
                    responseInfo.msg || "Registration failed",
                    "error"
                );
            }
        } catch (error) {
            console.error("Registration error:", error);
            showSnackbar("Network error. Please try again.", "error");
        }
    };

    return (
        <Grid container sx={{ minHeight: "100vh", overflow: "hidden" }}>
            {/* left side of the page */}
            <Grid size={windowSize.innerWidth < 900 ? 12 : 6}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        px: 4,
                    }}
                >
                    <Box sx={{ pl: { xs: 0, md: 12 } }}>
                        <Logo isDarkMode={isDarkMode} />
                    </Box>
                    <Box
                        sx={{
                            height: "calc(100% - 120px)",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {/* Multi-step registration implementation */}
                        {page === 0 && (
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                            }}>
                                <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
                                    Are you registering as a user or a partner?
                                </Typography>
                                <Button
                                    variant="contained"
                                    sx={{
                                        width: "50%",
                                        height: "100px",
                                        fontSize: "1.5rem",
                                        borderRadius: "12px",
                                        mb: 5,
                                    }}
                                    onClick={() => {
                                        setRole("user");
                                        pageNext();
                                    }}
                                >
                                    Register as User
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{
                                        width: "50%",
                                        height: "100px",
                                        fontSize: "1.5rem",
                                        borderRadius: "12px",
                                        backgroundColor: "#6f42c1",
                                        "&:hover": { backgroundColor: "#5a32a3" },
                                    }}
                                    onClick={() => {
                                        setRole("partner");
                                        pageNext();
                                    }}
                                >
                                    Register as Partner
                                </Button>
                            </Box>
                        )}
                        {page === 1 && (
                            <SignUpStepOne
                                userInfo={userInfo}
                                changeState={changeState}
                                pageNext={pageNext}
                            />
                        )}
                        {page === 2 && (
                            <SignUpStepTwo
                                userInfo={userInfo}
                                changeState={changeState}
                                pageBack={pageBack}
                                confirmEmail={confirmEmail}
                            />
                        )}
                        {page === 3 && (
                            <SignUpStepThree
                                verificationCode={verificationCode}
                                setVerificationCode={setVerificationCode}
                                registerButton={registerButton}
                                resendCode={resendCode} // ← pass this in
                            />
                        )}

                    </Box>
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
