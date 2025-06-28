import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, TextField, Button, Link, Step, StepLabel, Stepper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SignUpStepTwo = (props) => {
    const navigate = useNavigate();
    return (
        <Box>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2 }}>
                Create an account
            </Typography>
            <Stepper activeStep={1}>
                <Step><StepLabel /> </Step>
                <Step><StepLabel /> </Step>
            </Stepper>
            <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={props.userInfo.firstName}
                onChange={props.changeState("firstName")}
            />
            <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={props.userInfo.lastName}
                onChange={props.changeState("lastName")}
            />
            <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={props.userInfo.phone}
                onChange={props.changeState("phone")}
            />
            <TextField
                label="Postcode"
                variant="outlined"
                fullWidth
                margin="normal"
                value={props.userInfo.postcode}
                onChange={props.changeState("postcode")}
            />
            <Button fullWidth variant="contained" sx={{ bgcolor: "#800080", mb: 2 }} onClick={props.pageBack}>
                Back
            </Button>
            <Button fullWidth variant="contained" sx={{ bgcolor: "#800080", mb: 2 }} onClick={props.registerButton}>
                Sign Up
            </Button>

            <Typography variant="body2" align="center">
                Already have an account?{" "}
                <Link
                    underline="hover"
                    color="secondary"
                    sx={{ cursor: "pointer" }}
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