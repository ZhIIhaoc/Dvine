import { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Button,
    TextField,
    CircularProgress,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import MessageAlert from "../components/MessageAlert.jsx";
import { useNavigate } from "react-router-dom";
import SubmitForgottenPasswordRequest from "../endpoints/SubmitForgottenPasswordRequest.jsx";

const ForgottenPassword = () => {
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
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    return (
        <Box
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
                        If you’ve forgotten your password, enter your email and
                        we’ll send you a reset code to your email.
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
                        onChange={(e) => setVerificationCode(e.target.value)}
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
                                            setShowNewPassword((prev) => !prev)
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
        </Box>
    );
};

export default ForgottenPassword;
