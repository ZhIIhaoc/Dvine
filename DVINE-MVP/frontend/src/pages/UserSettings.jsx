import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Avatar, CircularProgress, Divider, Grid, Button } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from "react-router-dom";

const UserSettings = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch("http://localhost:8080/users/profile", {
                    method: "GET",
                    headers: {
                        Authorization: token,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (data.code === 0) {
                    setUser(data.data);
                } else {
                    setError(data.msg || "Failed to fetch user info.");
                }
            } catch (err) {
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return (
        <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f7f5f2" }}>
            <Paper elevation={8} sx={{ p: 5, borderRadius: 5, minWidth: 340, maxWidth: 420, width: '100%', bgcolor: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#7b1fa2', width: 80, height: 80, mb: 2 }}>
                        <AccountCircleIcon sx={{ fontSize: 60, color: '#fff' }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#5f0a87', mb: 1 }}>
                        Account Settings
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#7b1fa2', mb: 2 }}>
                        View your profile information
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: '#a4508b', mb: 2 }} />
                        <Typography>Loading your information...</Typography>
                    </Box>
                ) : error ? (
                    <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>{error}</Typography>
                ) : user ? (
                    <>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="body1"><b>Email:</b> {user.email || 'Not set'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1"><b>Nickname:</b> {user.nickName || 'Not set'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1"><b>First Name:</b> {user.firstName || 'Not set'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1"><b>Last Name:</b> {user.lastName || 'Not set'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1"><b>Phone:</b> {user.phone || 'Not set'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1"><b>Postcode:</b> {user.postcode || 'Not set'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body1"><b>Permission:</b> {user.permission === 1 ? 'Admin' : 'Regular User'}</Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 3 }} />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ borderRadius: 99, py: 1.2, fontWeight: 600, fontSize: '1.1rem', background: 'linear-gradient(90deg, #a4508b 0%, #5f0a87 100%)', boxShadow: '0 2px 12px 0 #a4508b33', mt: 1, '&:hover': { background: 'linear-gradient(90deg, #5f0a87 0%, #a4508b 100%)', transform: 'scale(1.03)' } }}
                            onClick={() => navigate(user.permission === 1 ? "/admin-dashboard" : "/user-dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </>
                ) : null}
            </Paper>
        </Box>
    );
};

export default UserSettings; 