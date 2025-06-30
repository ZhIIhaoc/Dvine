import React from "react";
import Logo from "../components/Logo.jsx";
import { Link, Box, Grid, IconButton, Typography } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";

export function Footer() {
    const navigate = useNavigate();
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: "#EDE9E3",
                mt: "auto",
                height: 400,
                padding: 4,
                px: 15,
            }}
        >
            <Grid
                container
                spacing={3}
                justifyContent="space-between"
                alignItems="center"
            >
                <Grid item>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{ width: 350 }}
                    >
                        <Box sx={{ position: "relative" }}>
                            <Logo sx={{ height: 200 }} />
                        </Box>
                        <Typography sx={{ mt: -3 }}>
                            Explore Port Macquarie’s vibrant culinary and <br />
                            wellness scene with DVINE Experiences.
                        </Typography>
                        <Box display="flex" gap={2} sx={{ mt: 3 }}>
                            <IconButton
                                component={Link}
                                target="_blank"
                                href="https://www.facebook.com/people/DVine-Experiences/100091963106038/"
                            >
                                <FacebookIcon fontSize="medium" />
                            </IconButton>
                            <IconButton
                                component={Link}
                                target="_blank"
                                href="https://www.instagram.com/dvinexperiences/"
                            >
                                <InstagramIcon fontSize="medium" />
                            </IconButton>
                            <IconButton
                                component={Link}
                                target="_blank"
                                href="https://www.linkedin.com/company/97438774/admin/feed/posts/"
                            >
                                <LinkedInIcon fontSize="medium" />
                            </IconButton>
                            <IconButton
                                component={Link}
                                target="_blank"
                                href="https://www.youtube.com/channel/UCsKSAdUVdOtVkB8PJB0gmSA"
                            >
                                <YouTubeIcon fontSize="medium" />
                            </IconButton>
                        </Box>
                    </Box>
                </Grid>
                <Grid
                    item
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    alignItems="flex-start"
                    sx={{ mt: 5, width: 350 }}
                >
                    <Typography variant="h6">Quick Link</Typography>
                    <Link
                        component="button"
                        onClick={() => navigate("/")}
                        underline="hover"
                        sx={{ color: "black" }}
                    >
                        Home
                    </Link>
                    <Link
                        component="button"
                        onClick={() => navigate("/catalogue")}
                        underline="hover"
                        sx={{ color: "black" }}
                    >
                        DVINE Experiences Catalog
                    </Link>
                    <Link
                        component="button"
                        onClick={() => navigate("/dvine-moments")}
                        underline="hover"
                        sx={{ color: "black" }}
                    >
                        DVINE Moments
                    </Link>
                </Grid>
                <Grid
                    item
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    alignItems="flex-start"
                    sx={{ mt: 5, width: 350 }}
                >
                    <Typography variant="h6">Contact</Typography>
                    <Box display="flex" gap={2}>
                        <LocationPinIcon color="action"></LocationPinIcon>
                        <Typography>Mid North Coast, Australia</Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                        <LocalPhoneIcon color="action"></LocalPhoneIcon>
                        <Typography
                            component="a"
                            href="tel:+61421395876"
                            sx={{ textDecoration: "none", color: "inherit" }}
                        >
                            +61 421 395 876
                        </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                        <EmailIcon color="action"></EmailIcon>
                        <Typography
                            component="a"
                            href="mailto:hello@dvinexperiences.com"
                            sx={{ textDecoration: "none", color: "inherit" }}
                        >
                            hello@dvinexperiences.com
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{ mt: 5 }}>
                <Typography align="center">
                    © {new Date().getFullYear()} DVINE Experiences. All rights
                    reserved.
                </Typography>
            </Box>
        </Box>
    );
}
