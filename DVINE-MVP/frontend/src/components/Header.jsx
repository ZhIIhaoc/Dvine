import React from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { useState, useContext } from "react";
import {
    AppBar,
    Box,
    Toolbar,
    Button,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
} from "@mui/material";

export function Header() {
    const navigate = useNavigate();
    // code taken from https://mui.com/material-ui/react-menu/
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const { token, logout } = useContext(AuthContext);
    console.log("token in Header:", token);

    return (
        <AppBar
            sx={{
                backgroundColor: "rgba(251, 249, 245, 0.8)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
            }}
            elevation={0}
            position="sticky"
        >
            <Toolbar
                sx={{
                    minHeight: 80,
                    alignItems: "flex-end",
                    mx: { xs: 0, sm: 3 },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1,
                        gap: 3,
                        ml: 10,
                    }}
                >
                    <Box sx={{ minWidth: 40 }}>
                        <Logo />
                    </Box>
                    <Button
                        sx={{ mt: 1, color: "black" }}
                        onClick={() => navigate("/catalogue")}
                    >
                        Tours
                    </Button>
                    <Button
                        sx={{ mt: 1, color: "black" }}
                        onClick={() => navigate("/dvine-moments")}
                    >
                        DVine Moments
                    </Button>
                </Box>
                {token && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                        }}
                    >
                        <IconButton sx={{ my: 2 }} onClick={handleClick}>
                            <Avatar />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate("/login");
                                }}
                            >
                                Sign In
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate("/user/settings");
                                }}
                            >
                                Account Settings
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate("/logout");
                                }}
                                sx={{ color: "red" }}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
                {!token && (
                    <Box
                        display="flex"
                        gap={3}
                        alignItems="center"
                        sx={{ pr: 10, pb: 3.5 }}
                    >
                        <Button
                            onClick={() => navigate("/login")}
                            sx={{ color: "black", textTransform: "none" }}
                        >
                            Log In
                        </Button>
                        <Button
                            onClick={() => navigate("/register")}
                            sx={{
                                color: "#fbf9f5",
                                background: "#8d198f",
                                "&:hover": {
                                    backgroundColor: "#6f146f",
                                },
                                borderRadius: 5,
                                py: 1,
                                px: 2,
                                textTransform: "none",
                            }}
                        >
                            Sign Up for Free
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
