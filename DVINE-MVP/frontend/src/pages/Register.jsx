import React from "react";
import PropTypes from "prop-types";
import { Grid, Box, Typography, TextField, Button, Link } from "@mui/material";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import MessageAlert from "../components/MessageAlert.jsx";

export const Register = (props) => {
    const [registerEmail, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [postcode, setPostcode] = React.useState("");
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [windowSize, setWindowSize] = React.useState(getWindowSize());
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

    const registerButton = async () => {
        if (registerEmail === "" || password === "" || confirmPassword === "" || phone === "" || postcode === "" || firstName === "" || lastName === "") {
            showSnackbar("Please fill in all fields", "warning");
            return;
        }
        if (password !== confirmPassword) {
            showSnackbar("Passwords do not match", "error");
            return;
        }
        const response = await fetch(
            `http://localhost:8080/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: registerEmail,
                    phone: phone,
                    password: password,
                    postcode: postcode,
                    firstName: firstName,
                    lastName: lastName,
                }),
            }
        );
        const responseInfo = await response.json();
        console.log(responseInfo);
        if (responseInfo.code === 0) {
            showSnackbar("Email already registered", "error");
        } else {
            // 解析 accessToken 和 refreshToken
            const { accessToken, refreshToken } = responseInfo.data || {};
            if (accessToken && refreshToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("Email", registerEmail);
                props.setToken(accessToken);
                showSnackbar("Registration successful", "success");
                navigate("/");
            } else {
                showSnackbar("Registration response error: token missing", "error");
            }
        }
    };

    return (
        <Grid container sx={{ height: "100vh" }}>
            {/* left side of the page */}
            <Grid size={windowSize.innerWidth < 500 ? 12 : 6}>
                <Logo />
                <Box
                    sx={{
                        width: "96%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        padding: 1,
                    }}
                >
                    <Typography variant="h4" sx={{ mb: 2 }}>
                        Create Account
                    </Typography>
                    <TextField
                        label="Email"
                        placeholder="example@gmail.com"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={registerEmail}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <TextField
                        label="Phone"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                    />
                    <TextField
                        label="Postcode"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={postcode}
                        onChange={(event) => setPostcode(event.target.value)}
                    />
                    <TextField
                        label="First Name"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                    />
                    <TextField
                        label="Last Name"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        sx={{ mb: 3 }}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
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
                </Box>
            </Grid>
            {windowSize.innerWidth >= 500 && (
                <Grid size={6}>
                    <img
                        src="../src/assets/background.jpg"
                        style={{ width: "100%", height: "100%" }}
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

Register.propTypes = {
    setToken: PropTypes.func,
};
