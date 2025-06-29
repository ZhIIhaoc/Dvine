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

const SignUpStepTwo = (props) => {
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
            <Stepper activeStep={1} sx={{ width: "40%" }}>
                <Step>
                    <StepLabel />{" "}
                </Step>
                <Step>
                    <StepLabel />{" "}
                </Step>
            </Stepper>
            <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                sx={{ my: 4, width: "70%" }}
                value={props.userInfo.firstName}
                onChange={props.changeState("firstName")}
            />
            <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                sx={{ mb: 4, width: "70%" }}
                value={props.userInfo.lastName}
                onChange={props.changeState("lastName")}
            />
            <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                sx={{ mb: 4, width: "70%" }}
                value={props.userInfo.phone}
                onChange={props.changeState("phone")}
            />
            <TextField
                label="Postcode"
                variant="outlined"
                fullWidth
                sx={{ mb: 6, width: "70%", justifyContent: "center" }}
                value={props.userInfo.postcode}
                onChange={props.changeState("postcode")}
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
                        color: "primary.main",
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
                    onClick={props.registerButton}
                >
                    Sign Up
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

export default SignUpStepTwo;

SignUpStepTwo.propTypes = {
    changeState: PropTypes.func.isRequired,
    userInfo: PropTypes.object.isRequired,
    pageBack: PropTypes.func.isRequired,
    registerButton: PropTypes.func.isRequired,
};
