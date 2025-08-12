import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTourById } from "../endpoints/CatalogueEndpoints";
import BookNowButton from "../components/BookNowButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import enGB from "date-fns/locale/en-GB"; // Import English locale
import {
    Box,
    Typography,
    CircularProgress,
    TextField,
    useTheme,
    Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import removeMarkdown from "remove-markdown";

export default function Checkout() {
    const theme = useTheme();
    const { tourId } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [travelDate, setTravelDate] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        async function loadTour() {
            try {
                const result = await fetchTourById(tourId);
                if (result && result.code === 0) {
                    setTour(result.data);
                }
            } catch (error) {
                console.error('Error loading tour:', error);
            } finally {
                setLoading(false);
            }
        }
        loadTour();
    }, [tourId]);

    if (loading) return <CircularProgress />;
    if (!tour) return <Typography>Tour not found.</Typography>;

    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "90vh",
                mx: "6%",
            }}
        >
            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/tour/${tourId}`)}
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 16,
                    color: "gray",
                    fontWeight: "regular",
                }}
            >
                Back to Experience Page
            </Button>
            <Box
                sx={{
                    maxWidth: 600,
                    mx: "auto",
                    p: 3,
                    mt: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Checkout
                </Typography>
                <Typography variant="h6">{tour.title}</Typography>
                <Typography color="text.secondary">
                    {tour.destination}
                </Typography>
                <Typography
                    sx={{
                        mt: -1,
                        mb: 4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {removeMarkdown(tour.description)}
                </Typography>
                <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={enGB}
                >
                    <DatePicker
                        label="Select Travel Date"
                        value={travelDate}
                        onChange={setTravelDate}
                        minDate={new Date()}
                        maxDate={
                            new Date(
                                new Date().setFullYear(
                                    new Date().getFullYear() + 2
                                )
                            )
                        }
                        
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                margin: "normal",
                                InputLabelProps: {
                                    shrink: true,
                                    sx: { color: theme.palette.text.primary },
                                },
                            },
                        }}
                    />
                </LocalizationProvider>
                <TextField
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        inputProps: {
                            min: 1,
                            step: 1,
                        },
                        sx: { color: theme.palette.text.primary },
                    }}
                    InputLabelProps={{
                        shrink: true,
                        sx: {
                            color: theme.palette.text.primary,
                        },
                    }}
                />
                <Box sx={{ mt: 3 }}>
                    <BookNowButton
                        tourId={tour.tourId}
                        quantity={quantity}
                        travelDate={
                            travelDate
                                ? travelDate.toISOString().split("T")[0]
                                : undefined
                        }
                        disabled={!travelDate}
                    />
                </Box>
            </Box>
        </Box>
    );
}
