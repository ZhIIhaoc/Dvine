import React from "react";
import Logo from "../components/Logo.jsx";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";

export function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: "#EDE9E3",
                mt: 5,
                height: 400,
                padding: 4,
                pl: 15,
            }}
        >
            <Grid container spacing={2} justifyContent="space-between">
                <Grid item>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <Box sx={{ position: "relative", ml: -1 }}>
                            <Logo sx={{ height: 200 }} />
                        </Box>
                        <Typography sx={{ mt: -3 }}>
                            Explore Port Macquarie’s vibrant culinary and <br />
                            wellness scene with DVINE Experiences.
                        </Typography>
                        {/* <IconButton
                            component={link}
                            href="https://www.instagram.com/dvinexperiences/"
                        >
                            <InstagramIcon fontSize="medium" />
                        </IconButton> */}
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
                <Typography align="center">
                    © {new Date().getFullYear()} DVINE Experiences. All rights
                    reserved.
                </Typography>
            </Box>
        </Box>
    );
}
