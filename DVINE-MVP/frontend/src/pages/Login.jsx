import React from "react";
import PropTypes from "prop-types";
import SubmitLogin from "../endpoints/SubmitLogin.js";
import { Grid, Box, Typography, TextField, Button, Link } from "@mui/material";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import MessageAlert from "../components/MessageAlert.jsx";
import { AuthContext } from "../components/AuthContext.jsx";
import { useContext } from "react";

export const Login = ({ isDarkMode, setIsDarkMode }) => {
    const [loginEmail, setLoginEmail] = React.useState("");
    const [loginPassword, setLoginPassword] = React.useState("");
    // const [isMobile, setIsMobile] = React.useState(false); // come back to this later
    const { setToken } = useContext(AuthContext);
    const [windowSize, setWindowSize] = React.useState(getWindowSize());
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");
    const [snackbarSeverity, setSnackbarSeverity] = React.useState("info");

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

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
    const loginButton = async () => {
        // alert("Login button clicked");
        // console.log("Login email: ", loginEmail);
        // console.log("Login password: ", loginPassword);
        if (loginEmail === "" || loginPassword === "") {
            showSnackbar("Please enter both email and password", "warning");
            return;
        }
        try {
            const response = await SubmitLogin(loginEmail, loginPassword);
            const responseInfo = await response.json();
            console.log(responseInfo);

            if (responseInfo.code === 0) {
                // Success case
                const { accessToken, refreshToken } = responseInfo.data || {};
                if (accessToken && refreshToken) {
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);
                    localStorage.setItem("Email", loginEmail);
                    setToken(accessToken);
                    // props.setToken(accessToken);
                    showSnackbar("Login successful!", "success");
                    navigate("/");
                } else {
                    showSnackbar(
                        "Login response error: token missing",
                        "error"
                    );
                }
            } else {
                // Error case
                showSnackbar(responseInfo.msg || "Login failed", "error");
            }
        } catch (error) {
            console.error("Login error:", error);
            showSnackbar("Network error. Please try again.", "error");
        }
    };

    return (
        // <>
        //     <h1>Login</h1>
        //     Email <input id="emailLogin" type="text" onChange={(event) => setLoginEmail(event.target.value)} value={loginEmail} /> <br />
        //     Password <input id="passwordLogin" type="password" onChange={(event) => setLoginPassword(event.target.value)} value={loginPassword} /> <br />
        //     <button id="loginButton" onClick={loginButton}>Login</button>
        // </>
        <Grid container sx={{ minHeight: "100vh", overflow: "hidden" }}>
            {/*left side of the page*/}
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
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h4" sx={{ mb: 6 }}>
                            Welcome Back!
                        </Typography>

                        <TextField
                            label="Email"
                            placeholder="example@gmail.com"
                            sx={{ mb: 4, width: "70%" }}
                            value={loginEmail}
                            onChange={(event) =>
                                setLoginEmail(event.target.value)
                            }
                            inputProps={{ 
                                "data-testid": "email-input",
                                "aria-label": "Email input"
                            }}
                            InputLabelProps={{
                                shrink: true,
                                sx: {
                                    color: "text.primary",
                                    fontSize: "1.2rem",
                                },
                            }}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            sx={{ mb: 6, width: "70%" }}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            inputProps={{ 
                                "data-testid": "password-input",
                                "aria-label": "Password input"
                            }}
                            InputLabelProps={{
                                shrink: true,
                                sx: {
                                    color: "text.primary",
                                    fontSize: "1.2rem",
                                },
                            }}
                        />

                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "primary",
                                mb: 4,
                                width: "70%",
                                height: "56px",
                            }}
                            onClick={loginButton}
                            data-testid="login-button"
                            aria-label="Login button"
                        >
                            Log in
                        </Button>
                        <Typography
                            variant="body2"
                            align="center"
                            sx={{ mb: 1 }}
                        >
                            <Link
                                underline="hover"
                                color="secondary"
                                sx={{ cursor: "pointer" }}
                                onClick={() => navigate("/password-reset")}
                            >
                                Forgot Password?
                            </Link>
                        </Typography>

                        <Typography variant="body2" align="center">
                            Don't have an account?{" "}
                            <Link
                                underline="hover"
                                color="secondary"
                                sx={{ cursor: "pointer", ml: 2 }}
                                onClick={() => navigate("/register")}
                            >
                                Sign up
                            </Link>
                        </Typography>
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

Login.propTypes = {
    setToken: PropTypes.func,
};
