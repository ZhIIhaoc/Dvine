import React from "react";
import PropTypes from "prop-types";
import {
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Step,
    StepLabel,
    Stepper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const SignUpStepOne = (props) => {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
            }}
        >
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                Create an account
            </Typography>
            <Stepper activeStep={0} sx={{ width: "40%" }}>
                <Step>
                    <StepLabel />
                    {""}
                </Step>
                <Step>
                    <StepLabel />{" "}
                </Step>
                <Step>
                    <StepLabel />{" "}
                </Step>
            </Stepper>
            <TextField
                label="Email"
                variant="outlined"
                fullWidth
                sx={{ mb: 4, mt: 10, width: "70%" }}
                value={props.userInfo.email}
                onChange={props.changeState("email")}
                InputLabelProps={{
                    shrink: true,
                    sx: { color: "text.primary", fontSize: "1.2rem" },
                }}
            />
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mb: 4, width: "70%" }}
                value={props.userInfo.password}
                onChange={props.changeState("password")}
                InputLabelProps={{
                    shrink: true,
                    sx: { color: "text.primary", fontSize: "1.2rem" },
                }}
            />
            <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mb: 11, width: "70%" }}
                value={props.userInfo.confirmPassword}
                onChange={props.changeState("confirmPassword")}
                InputLabelProps={{
                    shrink: true,
                    sx: { color: "text.primary", fontSize: "1.2rem" },
                }}
            />
            <Box
                sx={{
                    display: "flex",
                    width: "70%",
                    justifyContent: "center",
                    gap: 4,
                }}
            >
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: "background.default",
                        mb: 4,
                        width: "30%",
                        height: "56px",
                        color: "text.tertiary",
                        border: 3,
                        borderColor: "primary.main",
                    }}
                    onClick={props.pageBack}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: "primary",
                        mb: 4,
                        width: "70%",
                        height: "56px",
                    }}
                    onClick={props.pageNext}
                >
                    Next
                </Button>
            </Box>
            <Typography variant="body2" align="center">
                Already have an account?{" "}
                <Link
                    underline="hover"
                    color="secondary"
                    sx={{ cursor: "pointer", ml: 2 }}
                    onClick={() => navigate("/login")}
                >
                    Log in
                </Link>
            </Typography>
        </Box>
    );
};

export default SignUpStepOne;

SignUpStepOne.propTypes = {
    changeState: PropTypes.func.isRequired,
    userInfo: PropTypes.object.isRequired,
    pageNext: PropTypes.func.isRequired,
};
