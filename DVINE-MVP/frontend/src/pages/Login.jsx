import React from "react";
import PropTypes from "prop-types";
import SubmitLogin from "../endpoints/SubmitLogin.js";
import { Grid, Box, Typography, TextField, Button, Link } from "@mui/material";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import MessageAlert from "../components/MessageAlert.jsx";

export const Login = (props) => {
    const [loginEmail, setLoginEmail] = React.useState("");
    const [loginPassword, setLoginPassword] = React.useState("");
    // const [isMobile, setIsMobile] = React.useState(false); // come back to this later
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
        }
        const response = await SubmitLogin(loginEmail, loginPassword);
        const responseInfo = await response.json();
        console.log(responseInfo);
        if (responseInfo.code === 1) {
            showSnackbar("Invalid email or password", "error");
        } else {
            // props.setToken(responseInfo.token);
            localStorage.setItem("token", responseInfo.data.accessToken);
            localStorage.setItem("Email", loginEmail);
            showSnackbar("Login successful!", "success");
            navigate("/");
        }
    };

    return (
        // <>
        //     <h1>Login</h1>
        //     Email <input id="emailLogin" type="text" onChange={(event) => setLoginEmail(event.target.value)} value={loginEmail} /> <br />
        //     Password <input id="passwordLogin" type="password" onChange={(event) => setLoginPassword(event.target.value)} value={loginPassword} /> <br />
        //     <button id="loginButton" onClick={loginButton}>Login</button>
        // </>
        <Grid container sx={{ height: "100vh", overflow: "hidden" }}>
            {/*left side of the page*/}
            <Grid size={windowSize.innerWidth < 900 ? 12 : 6}>
                <Logo />

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
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
                        onChange={(event) => setLoginEmail(event.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        sx={{ mb: 6, width: "70%" }}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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
                    >
                        Log in
                    </Button>

                    <Typography variant="body2" align="center">
                        Don’t have an account?{" "}
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
