import { useEffect, useState } from "react";
import propTypes from "prop-types";
// import axios from "axios";
import { Header } from "../components/Header";
import { Box, Typography, Button } from "@mui/material";
import { DashboardHeaderCard } from "../components/DashboardHeaderCard";
import { useNavigate } from "react-router-dom";


export function UserDashboard() {
    console.log("UserDashboard gettoken:", localStorage.getItem("token"));
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
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
        console.log("im running");
    }, []);


    return (
        <>
            <Header />
            <DashboardHeaderCard />
            <Box sx={{
                width: "70%",
                mx: "auto",
                display: "flex",
                justifyContent: "flex-start",

            }}
            >
                <Box
                    sx={{
                        border: "2px black solid",
                        borderRadius: "16px",
                        width: "30%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "white",
                        mb: 5,
                        mt: -4,
                        padding: 2,
                        
                    }}>
                    <Button onClick={() => navigate("/members")}>Upgrade Members</Button>

                        
                </Box>
            </Box>
            <Box sx={{
                width: "70%",
                mx: "auto",
                display: "flex",
                justifyContent: "flex-start",

            }}
            >
                <Box
                    sx={{
                        border: "2px black solid",
                        borderRadius: "16px",
                        width: "30%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "white",
                        padding: 2,
                        
                    }}>
                    <Typography>
                        Upgrade your account
                    </Typography>
                </Box>
            </Box>

        </>
    );
};