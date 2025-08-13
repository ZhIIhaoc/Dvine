import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
} from "@mui/material";
/**
 * SignUpStepThree component allows users to enter the verification code
 * as the third step in the sign up process.
 */

const SignUpStepThree = ({
    verificationCode,
    setVerificationCode,
    registerButton,
    resendCode,
}) => {
    const [resending, setResending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const handleResend = async () => {
        setCooldown(10);
        setResending(true);
        await resendCode();
        setResending(false);
    };

    const handleVerify = async () => {
        setVerifying(true);
        await registerButton();
        setVerifying(false);
    };

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                px: 4,
            }}
        >
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2 }}>
                Confirm your email
            </Typography>

            <Typography
                variant="body1"
                align="center"
                sx={{ mb: 4, maxWidth: 400 }}
            >
                We&apos;ve sent a verification code to your email. Please enter
                it below to complete your registration.
            </Typography>

            <Stepper activeStep={2} sx={{ width: "40%", mb: 6 }}>
                <Step>
                    <StepLabel />
                </Step>
                <Step>
                    <StepLabel />
                </Step>
                <Step>
                    <StepLabel />
                </Step>
            </Stepper>

            <TextField
                label="Verification Code"
                variant="outlined"
                fullWidth
                sx={{ width: "70%", mb: 6 }}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
            />

            <Box
                sx={{
                    display: "flex",
                    width: "70%",
                    justifyContent: "center",
                    gap: 3,
                }}
            >
                <Button
                    variant="outlined"
                    disabled={resending || cooldown > 0}
                    sx={{
                        width: "30%",
                        height: "56px",
                        border: 3,
                        color: "primary.main",
                        borderColor: "primary.main",
                    }}
                    onClick={handleResend}
                >
                    {resending ? (
                        <CircularProgress size={24} />
                    ) : cooldown > 0 ? (
                        `Resend (${cooldown})`
                    ) : (
                        "Resend Code"
                    )}
                </Button>

                <Button
                    variant="contained"
                    disabled={verifying}
                    sx={{
                        width: "70%",
                        height: "56px",
                        bgcolor: "primary.main",
                    }}
                    onClick={handleVerify}
                >
                    {verifying ? (
                        <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                        "Verify Email"
                    )}
                </Button>
            </Box>
        </Box>
    );
};

export default SignUpStepThree;
