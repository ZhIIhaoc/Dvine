import { useEffect, useState } from "react";
// import propTypes from "prop-types";
// import axios from "axios";
import { Header } from "../components/Header";
import { Box, Typography, Button, Grid } from "@mui/material";
import { DashboardHeaderCard } from "../components/DashboardHeaderCard";
import { useNavigate } from "react-router-dom";
import { CreateTourModal } from "../components/CreateTourModal.jsx";


export function AdminDashboard() {
    const token = localStorage.getItem("accessToken");
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const userName = userInfo?.nickName || userInfo?.firstName || "User";
    const fetchUserInfo = async () => {
        try {
            const response = await fetch('http://localhost:8080/users/profile', {
                method: 'GET',
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const responseInfo = await response.json();
            console.log("User Info Response:", responseInfo);

            if (responseInfo.code === 0) {
                setUserInfo(responseInfo.data);
                console.log("User Info CAMERON:", responseInfo.data);
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchUserInfo();
        // console.log("im running");
    }, []);


    return (
        <>
            <Header />
            {userInfo ? (
            <>
                <Typography sx={{ textAlign: "center", mt: 10, mb: 2, fontSize: "2rem", fontWeight: "bold", color: "purple" }}> Welcome Back {userName} </Typography>
                <DashboardHeaderCard />
                <Box sx={{ width: "70%", mx: "auto", mt: -4 }}>
                    <Grid container spacing={3}>
                        <Grid size={6}>
                            <Box
                                sx={{
                                    border: "2px black solid",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    padding: 2,
                                    mb: 3,
                                    textAlign: "center",
                                }}
                            >
                                <Button fullWidth onClick={() => navigate("/members")}>Upgrade Members</Button>
                            </Box>

                            <Box
                                sx={{
                                    border: "2px black solid",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    padding: 2,
                                    mb: 3,
                                    textAlign: "center",
                                }}
                            >
                                <Button onClick={() => setModalOpen(true)}><Typography>Create Tour</Typography></Button>
                            </Box>
                            <CreateTourModal open={modalOpen} onClose={() => setModalOpen(false)} />

                            <Box
                                sx={{
                                    border: "2px black solid",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    padding: 2,
                                    textAlign: "center",
                                }}
                            >
                                <Typography fontWeight="bold">Profile</Typography>
                                <Button fullWidth><Typography color="text.secondary">+ Introduce yourself</Typography></Button>
                                <Button fullWidth><Typography color="text.secondary">+ Add a trip</Typography></Button>
                                <Button fullWidth><Typography color="text.secondary">+ Make a review</Typography></Button>
                            </Box>
                        </Grid>

                        {/* Right Column - Next Tour Box */}
                        <Grid size={6}>
                            <Box
                                sx={{
                                    border: "2px black solid",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    padding: 4,
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Your Next Tour
                                </Typography>
                                {/* Placeholder image or details */}
                                <Typography color="text.secondary">Date: </Typography>
                                <Typography color="text.secondary">Beach: </Typography>
                                <img
                                    src="../src/assets/background.png"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </>
            ) : (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <Typography variant="h4">Loading User Information...</Typography>
            </Box>
            )}

        </>
    );
};