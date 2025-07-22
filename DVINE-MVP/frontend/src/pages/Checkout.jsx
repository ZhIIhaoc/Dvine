import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTourById } from "../endpoints/CatalogueEndpoints";
import BookNowButton from "../components/BookNowButton";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box, Typography, CircularProgress, TextField } from "@mui/material";

export default function Checkout() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelDate, setTravelDate] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadTour() {
      const result = await fetchTourById(tourId);
      if (result.code === 0) setTour(result.data);
      setLoading(false);
    }
    loadTour();
  }, [tourId]);

  if (loading) return <CircularProgress />;
  if (!tour) return <Typography>Tour not found.</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 6, p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>Checkout</Typography>
      <Typography variant="h6">{tour.title}</Typography>
      <Typography color="text.secondary">{tour.destination}</Typography>
      <Typography sx={{ my: 2 }}>{tour.description}</Typography>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select Travel Date"
          value={travelDate}
          onChange={setTravelDate}
          minDate={new Date()}
          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />
      </LocalizationProvider>
      <TextField
        label="Quantity"
        type="number"
        value={quantity}
        onChange={e => setQuantity(Number(e.target.value))}
        inputProps={{ min: 1, max: 10 }}
        fullWidth
        margin="normal"
      />
      <Box sx={{ mt: 3 }}>
        <BookNowButton
          tourId={tour.tourId}
          quantity={quantity}
          travelDate={travelDate ? travelDate.toISOString().split('T')[0] : undefined}
          disabled={!travelDate}
        />
      </Box>
    </Box>
  );
} 