import React from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import {
    AppBar, Box, Toolbar, Button, Avatar,
    IconButton, Menu, MenuItem
} from "@mui/material";


export function Header() {
    const navigate = useNavigate();
    // code taken from https://mui.com/material-ui/react-menu/ 
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);
    };
    


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
                    <IconButton onClick={handleClick}>
                        <Avatar />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >  
                        <MenuItem onClick={() => {handleClose(); navigate('/profile')}}>Account Settings</MenuItem>
                        <MenuItem onClick={() => {handleClose(); navigate('/login')}} sx={{color: "red" }}>Logout</MenuItem>
                    </Menu>
                </Box>   
            </Toolbar>
        </AppBar>
    );
}