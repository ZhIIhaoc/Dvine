import React, { useEffect, useState, useContext } from "react";
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Avatar,
    Divider,
    Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/authUtils.js";
import { AuthContext } from "../components/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";

const Logout = () => {
    const navigate = useNavigate();
    const { setToken } = useContext(AuthContext) || {};
    const [loading, setLoading] = useState(true);
    const [, setMessage] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
        const doLogout = async () => {
            try {
                await logout(
                    setToken || (() => {}),
                    () => {},
                    (msg) => setMessage(msg)
                );
                setMessage(
                    "You have been logged out successfully. See you next time!"
                );
            } catch {
                setMessage("Logout failed. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        doLogout();
        // eslint-disable-next-line
    }, []);

    return (
        <Box
            sx={{
                minHeight: "90vh",
                width: "100vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "background.default",
            }}
        >
            <Fade in timeout={800}>
                <Paper
                    elevation={12}
                    sx={{
                        p: 6,
                        borderRadius: 6,
                        minWidth: 350,
                        maxWidth: 420,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        bgcolor: "rgba(255,255,255,0.7)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.3)",
                    }}
                >
                    <Avatar
                        sx={{
                            bgcolor:
                                "linear-gradient(135deg, #a4508b 0%, #5f0a87 100%)",
                            width: 80,
                            height: 80,
                            mb: 2,
                            boxShadow: "0 4px 24px 0 rgba(164,80,139,0.18)",
                            animation: loading
                                ? "spin 1.2s linear infinite"
                                : "none",
                            background:
                                "linear-gradient(135deg, #a4508b 0%, #5f0a87 100%)",
                        }}
                    >
                        <LogoutIcon sx={{ fontSize: 48, color: "#fff" }} />
                    </Avatar>
                    <Typography
                        variant="h4"
                        sx={{
                            mb: 1,
                            fontWeight: 700,
                            letterSpacing: 1,
                            color: "#5f0a87",
                            textShadow: "0 2px 8px #e0e7ff",
                        }}
                    >
                        Logged Out
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 3,
                            color: "#7b1fa2",
                            fontWeight: 400,
                            textAlign: "center",
                        }}
                    >
                        {loading
                            ? "Logging you out securely..."
                            : "You have safely logged out. We look forward to seeing you again!"}
                    </Typography>
                    <Divider sx={{ width: "80%", mb: 3, bgcolor: "#e1bee7" }} />
                    {loading ? (
                        <CircularProgress sx={{ mb: 2, color: "#a4508b" }} />
                    ) : (
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            sx={{
                                mt: 1,
                                borderRadius: 99,
                                px: 6,
                                py: 1.5,
                                fontWeight: 600,
                                fontSize: "1.1rem",
                                background:
                                    "linear-gradient(90deg, #a4508b 0%, #5f0a87 100%)",
                                boxShadow: "0 2px 12px 0 #a4508b33",
                                transition: "all 0.2s",
                                color: "white",
                                "&:hover": {
                                    background:
                                        "linear-gradient(90deg, #5f0a87 0%, #a4508b 100%)",
                                    transform: "scale(1.05)",
                                    boxShadow: "0 4px 24px 0 #a4508b44",
                                },
                            }}
                            onClick={() => navigate("/")}
                        >
                            Back to Home
                        </Button>
                    )}
                </Paper>
            </Fade>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Box>
    );
};

export default Logout;
