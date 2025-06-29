import React from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import {
    AppBar, Box, Toolbar, Button, Avatar,
    IconButton
} from "@mui/material";


export function Header() {
    const navigate = useNavigate();

    return (
        <AppBar color="transparent" elevation={0} position="static">
            <Toolbar sx={{ minHeight: 80, alignItems: 'flex-end' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Logo />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', flexGrow: 1, gap: 2 }}>
                    <Button onClick={() => navigate("/catalogue")}>Tours</Button>
                    <Button onClick={() => navigate("/dvine-moments")}>DVine Moments</Button>

                </Box> 
                <Box sx={{ display: 'flex', alignItems: 'center',  flexGrow: 1, justifyContent: 'flex-end' }}>
                    <IconButton>
                        <Avatar />
                    </IconButton>
                </Box>   
            </Toolbar>
        </AppBar>
    );
}