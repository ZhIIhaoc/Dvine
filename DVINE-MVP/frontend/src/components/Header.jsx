import React from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import {
    AppBar,
    Box,
    Toolbar,
    Button,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Switch,
    Typography,
    useTheme,
    Tooltip,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";

export function Header({ isDarkMode, setIsDarkMode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPartner, setIsPartner] = useState(false);
    const navigate = useNavigate();
    // some code taken from https://mui.com/material-ui/react-menu/
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const location = useLocation();
    const currentPath = location.pathname;
    const { token, userInfo } = useContext(AuthContext);
    useEffect(() => {
        if (userInfo) {
            setIsAdmin(
                    userInfo.permission == 4 ||
                    userInfo.permission == 5
            );
            setIsPartner(userInfo.permission == 2 || userInfo.permission == 3);
        }
    }, [userInfo]);
    const theme = useTheme();
    {
        /* mobile responsible */
    }
    const [mobileOpen, setMobileOpen] = useState(false);
    const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

    return (
        <>
            <AppBar
                sx={{
                    backgroundColor: theme.palette.header.main,
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                }}
                elevation={0}
                position="fixed"
            >
                <Toolbar
                    sx={{
                        height: 95,
                        alignItems: "flex-end",
                        overflowX: "hidden",
                        mx: { xs: 1, sm: 2, md: 10 },
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            flexGrow: 1,
                            gap: 3,
                        }}
                    >
                        <Box sx={{ minWidth: 40 }}>
                            <Logo isDarkMode={isDarkMode} />
                        </Box>
                        <Box sx={{ display: { xs: "none", md: "flex" } }}>
                            <Button
                                sx={{
                                    mt: 1,
                                    color: "text.primary",
                                    borderBottom:
                                        currentPath === "/catalogue"
                                            ? "2px solid"
                                            : "none",
                                    borderColor: "text.tertiary",
                                    borderRadius: 0,
                                }}
                                onClick={() => navigate("/catalogue")}
                            >
                                Experiences Catalogue
                            </Button>
                            <Button
                                sx={{
                                    mt: 1,
                                    color: "text.primary",
                                    borderBottom:
                                        currentPath === "/dvine-moments"
                                            ? "2px solid"
                                            : "none",
                                    borderColor: "text.tertiary",
                                    borderRadius: 0,
                                }}
                                onClick={() => navigate("/dvine-moments")}
                            >
                                DVine Moments
                            </Button>
                        </Box>
                    </Box>
                    {token && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                height: "100%",
                            }}
                        >
                            {isAdmin ? (
                                <Button
                                    sx={{
                                        mt: 0,
                                        color: "text.primary",
                                        mr: 3,
                                        borderBottom:
                                            currentPath === "/admin-dashboard"
                                                ? "2px solid"
                                                : "none",
                                        borderColor: "text.tertiary",
                                        borderRadius: 0,
                                    }}
                                    onClick={() => navigate("/admin-dashboard")}
                                >
                                    Admin Dashboard
                                </Button>
                            ) : isPartner ? (
                                <Button
                                    sx={{
                                        mt: 0,
                                        color: "text.primary",
                                        mr: 3,
                                        borderBottom:
                                            currentPath === "/partner-dashboard"
                                                ? "2px solid"
                                                : "none",
                                        borderColor: "text.tertiary",
                                        borderRadius: 0,
                                    }}
                                    onClick={() => navigate("/partner-dashboard")}
                                >
                                    Partner Dashboard
                                </Button>
                            ) : (
                                <Button
                                    sx={{
                                        mt: 0,
                                        color: "text.primary",
                                        mr: 3,
                                        borderBottom:
                                            currentPath === "/user-dashboard"
                                                ? "2px solid"
                                                : "none",
                                        borderColor: "text.tertiary",
                                        borderRadius: 0,
                                    }}
                                    onClick={() => navigate("/user-dashboard")}
                                >
                                    User Dashboard
                                </Button>
                            )}

                            <IconButton
                                sx={{ my: 2, mr: { xs: 2, sm: 4, md: 5 } }}
                                onClick={handleClick}
                            >
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
                                disableScrollLock
                            >
                                <MenuItem
                                    onClick={() => {
                                        handleClose();
                                        navigate("/user/settings");
                                    }}
                                    sx={{ px: 3, py: 1, mt: 1 }}
                                >
                                    Account Settings
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        handleClose();
                                        navigate("/logout");
                                    }}
                                    sx={{ color: "red", px: 3, py: 1, mb: 1 }}
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
                            sx={{
                                pr: 10,
                                pb: 3.5,
                                display: { xs: "none", md: "flex" },
                            }}
                        >
                            <Button
                                onClick={() => navigate("/login")}
                                sx={{
                                    color: "text.primary",
                                    textTransform: "none",
                                }}
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
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                        sx={{ pr: 3, height: "100%" }}
                    >
                        <Tooltip
                            title={
                                isDarkMode
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                        >
                            <IconButton
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                sx={{
                                    color: "text.primary",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    p: 1,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },
                                    display: { xs: "none", md: "flex" },
                                }}
                            >
                                {isDarkMode ? (
                                    <LightModeIcon />
                                ) : (
                                    <DarkModeIcon />
                                )}
                            </IconButton>
                            <IconButton
                                sx={{
                                    display: { xs: "flex", md: "none" },
                                }}
                                onClick={toggleMobileMenu}
                            >
                                <MenuIcon sx={{ color: "text.primary" }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>
            <Toolbar sx={{ height: 95 }} />
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={toggleMobileMenu}
                transitionDuration={250}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                    },
                }}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: "80%",
                        p: 6,
                        backgroundColor: theme.palette.header.main,
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        boxShadow: "black",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    },
                }}
            >
                <IconButton
                    onClick={toggleMobileMenu}
                    sx={{
                        position: "fixed",
                        top: 20,
                        left: "80%",
                        color: "text.primary",
                        "&:hover": {
                            backgroundColor: "action.hover",
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
                {/**upper half */}
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    alignItems="center"
                    sx={{ mb: 6 }}
                >
                    <Box
                        sx={{
                            minWidth: 40,
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                        onClick={toggleMobileMenu}
                    >
                        <Logo isDarkMode={isDarkMode} />
                    </Box>
                    <Button
                        sx={{
                            color: "text.primary",
                            borderBottom:
                                currentPath === "/" ? "2px solid" : "none",
                            borderColor: "text.tertiary",
                            borderRadius: 0,
                            width: 200,
                            justifyContent: "flex-start",
                        }}
                        onClick={() => {
                            navigate("/");
                            toggleMobileMenu();
                        }}
                    >
                        Home
                    </Button>
                    <Button
                        sx={{
                            color: "text.primary",
                            borderBottom:
                                currentPath === "/catalogue"
                                    ? "2px solid"
                                    : "none",
                            borderColor: "text.tertiary",
                            borderRadius: 0,
                            width: 200,
                            justifyContent: "flex-start",
                        }}
                        onClick={() => {
                            navigate("/catalogue");
                            toggleMobileMenu();
                        }}
                    >
                        Experiences Catalogue
                    </Button>
                    <Button
                        sx={{
                            color: "text.primary",
                            borderBottom:
                                currentPath === "/dvine-moments"
                                    ? "2px solid"
                                    : "none",
                            borderColor: "text.tertiary",
                            borderRadius: 0,
                            width: 200,
                            justifyContent: "flex-start",
                        }}
                        onClick={() => {
                            navigate("/dvine-moments");
                            toggleMobileMenu();
                        }}
                    >
                        DVine Moments
                    </Button>
                </Box>

                {/**lower half */}
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    alignItems="center"
                >
                    {token && (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "start",
                                justifyContent: "flex-end",
                                pb: 4,
                            }}
                            gap={1}
                        >
                            {isAdmin ? (
                                <Button
                                    sx={{
                                        color: "text.primary",
                                        borderBottom:
                                            currentPath === "/admin-dashboard"
                                                ? "2px solid"
                                                : "none",
                                        borderColor: "text.tertiary",
                                        borderRadius: 0,
                                        width: 200,
                                        justifyContent: "flex-start",
                                    }}
                                    onClick={() => {
                                        navigate("/admin-dashboard");
                                        toggleMobileMenu();
                                    }}
                                >
                                    Admin Dashboard
                                </Button>
                            ) : isPartner ? (
                                <Button
                                    sx={{
                                        color: "text.primary",
                                        borderBottom:
                                            currentPath === "/partner-dashboard"
                                                ? "2px solid"
                                                : "none",
                                        borderColor: "text.tertiary",
                                        borderRadius: 0,
                                        width: 200,
                                        justifyContent: "flex-start",
                                    }}
                                    onClick={() => {
                                        navigate("/partner-dashboard");
                                        toggleMobileMenu();
                                    }}
                                >
                                    Partner Dashboard
                                </Button>
                            ) : (
                                <Button
                                    sx={{
                                        color: "text.primary",
                                        borderBottom:
                                            currentPath === "/user-dashboard"
                                                ? "2px solid"
                                                : "none",
                                        borderColor: "text.tertiary",
                                        borderRadius: 0,
                                        width: 200,
                                        justifyContent: "flex-start",
                                    }}
                                    onClick={() => {
                                        navigate("/user-dashboard");
                                        toggleMobileMenu();
                                    }}
                                >
                                    User Dashboard
                                </Button>
                            )}

                            <Button
                                onClick={() => {
                                    toggleMobileMenu();
                                    navigate("/user/settings");
                                }}
                                sx={{
                                    color: "text.primary",
                                    borderBottom:
                                        currentPath === "/user-dashboard"
                                            ? "2px solid"
                                            : "none",
                                    borderColor: "text.tertiary",
                                    borderRadius: 0,
                                    width: 200,
                                    justifyContent: "flex-start",
                                }}
                            >
                                Account Settings
                            </Button>
                            <Button
                                onClick={() => {
                                    toggleMobileMenu();
                                    navigate("/logout");
                                }}
                                sx={{
                                    color: "red",
                                    width: 200,
                                    justifyContent: "flex-start",
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    )}
                    {!token && (
                        <Box
                            display="flex"
                            gap={1}
                            alignItems="center"
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "start",
                                justifyContent: "flex-end",
                                pb: 4,
                                width: 200,
                            }}
                        >
                            <Button
                                onClick={() => {
                                    navigate("/login");
                                    toggleMobileMenu();
                                }}
                                sx={{
                                    color: "text.primary",
                                    textTransform: "none",
                                }}
                            >
                                Log In
                            </Button>
                            <Button
                                onClick={() => {
                                    navigate("/register");
                                    toggleMobileMenu();
                                }}
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
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Tooltip
                            title={
                                isDarkMode
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                        >
                            <IconButton
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                sx={{
                                    color: "text.primary",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    p: 1,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },
                                }}
                            >
                                {isDarkMode ? (
                                    <LightModeIcon />
                                ) : (
                                    <DarkModeIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}
