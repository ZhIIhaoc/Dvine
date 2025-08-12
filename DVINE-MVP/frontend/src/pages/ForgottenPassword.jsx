import React from "react";
import { useState, useEffect } from "react";
import {
    Typography,
    Grid,
    Box,
    Button,
    TextField,
    CircularProgress,
    IconButton,
    InputAdornment,
    Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import MessageAlert from "../components/MessageAlert.jsx";
import { useNavigate } from "react-router-dom";
import SubmitForgottenPasswordRequest from "../endpoints/SubmitForgottenPasswordRequest.jsx";
import Logo from "../components/Logo.jsx";

const ForgottenPassword = ({ isDarkMode, setIsDarkMode }) => {
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(0); // step 0 = enter email, step 1 = verify code
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("info");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [windowSize, setWindowSize] = React.useState(getWindowSize());

    const showSnackbar = (message, severity = "info") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSendResetCode = async () => {
        if (!email) {
            showSnackbar("Email is required.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const response = await SubmitForgottenPasswordRequest(email);
            const responseInfo = await response.json();

            if (responseInfo.code === 0) {
                showSnackbar("Reset code sent! Check your inbox.", "success");
                setStep(1); // move to step 2
                setCooldown(10);
            } else {
                showSnackbar(
                    responseInfo.msg || "Failed to send reset code.",
                    "error"
                );
            }
        } catch (error) {
            showSnackbar(`${error.message} Network error. Try again.`, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        if (!verificationCode || !newPassword || !confirmPassword) {
            showSnackbar("All fields are required.", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showSnackbar("Passwords do not match.", "error");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(
                "http://localhost:8080/auth/reset-password",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email,
                        verificationCode: verificationCode,
                        newPassword: newPassword,
                    }),
                }
            );
            const responseInfo = await response.json();

            if (responseInfo.code === 0) {
                showSnackbar("Password reset successfully!", "success");
                // optionally redirect to login
                navigate("/login");
            } else {
                showSnackbar(
                    responseInfo.msg || "Failed to reset password.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            showSnackbar("Network error.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        function handleWindowResize() {
            // console.log(getWindowSize());
            setWindowSize(getWindowSize());
        }
        window.addEventListener("resize", handleWindowResize);

        return () => {
            window.removeEventListener("resize", handleWindowResize);
        };
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    function getWindowSize() {
        const { innerWidth, innerHeight } = window;
        return { innerWidth, innerHeight };
    }

    return (
        <>
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
                            {step === 0 ? (
                                <>
                                    <Typography
                                        variant="h4"
                                        gutterBottom
                                        align="center"
                                        sx={{ mb: 2 }}
                                    >
                                        Forgotten Password
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        align="center"
                                        sx={{ maxWidth: 400, mb: 4 }}
                                    >
                                        If you’ve forgotten your password, enter
                                        your email and we’ll send you a reset
                                        code to your email.
                                    </Typography>
                                    <TextField
                                        label="Email"
                                        variant="outlined"
                                        fullWidth
                                        sx={{ width: "70%", mb: 2 }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        inputProps={{ "data-testid": "email-input" }}
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
                                        color="primary"
                                        fullWidth
                                        disabled={submitting || cooldown > 0}
                                        sx={{
                                            height: "56px",
                                            width: "70%",
                                            mb: 2,
                                        }}
                                        onClick={handleSendResetCode}
                                        data-testid="send-code-button"
                                    >
                                        {submitting ? (
                                            <CircularProgress
                                                size={24}
                                                sx={{ color: "white" }}
                                            />
                                        ) : cooldown > 0 ? (
                                            `Resend (${cooldown})`
                                        ) : (
                                            "Send Code"
                                        )}
                                    </Button>
                                    <Typography
                                        variant="body2"
                                        align="center"
                                        sx={{ mt: 4 }}
                                    >
                                        Don't have an account?{" "}
                                        <Link
                                            underline="hover"
                                            color="secondary"
                                            sx={{ cursor: "pointer", ml: 2 }}
                                            onClick={() =>
                                                navigate("/register")
                                            }
                                        >
                                            Sign up
                                        </Link>
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography
                                        variant="h4"
                                        gutterBottom
                                        align="center"
                                        sx={{ mb: 2 }}
                                    >
                                        Reset Your Password
                                    </Typography>
                                    <TextField
                                        label="Verification Code"
                                        variant="outlined"
                                        fullWidth
                                        sx={{ width: "70%", mb: 2 }}
                                        value={verificationCode}
                                        onChange={(e) =>
                                            setVerificationCode(e.target.value)
                                        }
                                        inputProps={{ "data-testid": "verification-code-input" }}
                                    />
                                    <TextField
                                        label="New Password"
                                        variant="outlined"
                                        type={
                                            showNewPassword
                                                ? "text"
                                                : "password"
                                        }
                                        fullWidth
                                        sx={{ width: "70%", mb: 2 }}
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        inputProps={{ "data-testid": "new-password-input" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() =>
                                                            setShowNewPassword(
                                                                (prev) => !prev
                                                            )
                                                        }
                                                        edge="end"
                                                    >
                                                        {showNewPassword ? (
                                                            <VisibilityOff />
                                                        ) : (
                                                            <Visibility />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        label="Confirm New Password"
                                        variant="outlined"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        fullWidth
                                        sx={{ width: "70%", mb: 4 }}
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        inputProps={{ "data-testid": "confirm-password-input" }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                (prev) => !prev
                                                            )
                                                        }
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? (
                                                            <VisibilityOff />
                                                        ) : (
                                                            <Visibility />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        disabled={submitting}
                                        sx={{
                                            height: "56px",
                                            width: "70%",
                                            mb: 2,
                                        }}
                                        onClick={handleResetPassword}
                                        data-testid="reset-password-button"
                                    >
                                        {submitting ? (
                                            <CircularProgress
                                                size={24}
                                                sx={{ color: "white" }}
                                            />
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                </>
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
            {/* <Box
                sx={{
                    minHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    px: 4,
                }}
            >
                {step === 0 ? (
                    <>
                        <Typography
                            variant="h4"
                            gutterBottom
                            align="center"
                            sx={{ mb: 2 }}
                        >
                            Forgotten Password
                        </Typography>

                        <Typography
                            variant="body1"
                            align="center"
                            sx={{ maxWidth: 400, mb: 4 }}
                        >
                            If you’ve forgotten your password, enter your email
                            and we’ll send you a reset code to your email.
                        </Typography>
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            sx={{ width: "70%", mb: 4 }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputLabelProps={{
                                sx: { color: "text.primary" },
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={submitting || cooldown > 0}
                            sx={{ height: "56px", width: "70%", mb: 2 }}
                            onClick={handleSendResetCode}
                        >
                            {submitting ? (
                                <CircularProgress
                                    size={24}
                                    sx={{ color: "white" }}
                                />
                            ) : cooldown > 0 ? (
                                `Resend (${cooldown})`
                            ) : (
                                "Send Code"
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography
                            variant="h4"
                            gutterBottom
                            align="center"
                            sx={{ mb: 2 }}
                        >
                            Reset Your Password
                        </Typography>
                        <TextField
                            label="Verification Code"
                            variant="outlined"
                            fullWidth
                            sx={{ width: "70%", mb: 2 }}
                            value={verificationCode}
                            onChange={(e) =>
                                setVerificationCode(e.target.value)
                            }
                        />
                        <TextField
                            label="New Password"
                            variant="outlined"
                            type={showNewPassword ? "text" : "password"}
                            fullWidth
                            sx={{ width: "70%", mb: 2 }}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() =>
                                                setShowNewPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                            edge="end"
                                        >
                                            {showNewPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Confirm New Password"
                            variant="outlined"
                            type={showConfirmPassword ? "text" : "password"}
                            fullWidth
                            sx={{ width: "70%", mb: 4 }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                            edge="end"
                                        >
                                            {showConfirmPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={submitting}
                            sx={{ height: "56px", width: "70%", mb: 2 }}
                            onClick={handleResetPassword}
                        >
                            {submitting ? (
                                <CircularProgress
                                    size={24}
                                    sx={{ color: "white" }}
                                />
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </>
                )}

                <MessageAlert
                    open={snackbarOpen}
                    onClose={() => setSnackbarOpen(false)}
                    message={snackbarMessage}
                    severity={snackbarSeverity}
                />
            </Box> */}
        </>
    );
};

export default ForgottenPassword;
