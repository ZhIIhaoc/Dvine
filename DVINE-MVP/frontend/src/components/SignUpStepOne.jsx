import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, TextField, Button, Link, Step, StepLabel, Stepper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SignUpStepOne = (props) => {
    const navigate = useNavigate();
    return (
        <Box>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2 }}>
                Create an account
            </Typography>
            <Stepper activeStep={0}>
                <Step><StepLabel /> </Step>
                <Step><StepLabel /> </Step>
            </Stepper>
            <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={props.userInfo.email}
                onChange={props.changeState("email")}
            />
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={props.userInfo.password}
                onChange={props.changeState("password")}
            />
            <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={props.userInfo.confirmPassword}
                onChange={props.changeState("confirmPassword")}
            />
            <Button fullWidth variant="contained" sx={{ bgcolor: "#800080", mb: 2 }} onClick={props.pageNext}>
                Next
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

export default SignUpStepOne;

SignUpStepOne.propTypes = {
    changeState: PropTypes.func.isRequired,
    userInfo: PropTypes.object.isRequired,
    pageNext: PropTypes.func.isRequired,
};