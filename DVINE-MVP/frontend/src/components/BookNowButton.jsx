import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button, CircularProgress } from "@mui/material";

const STRIPE_PUBLIC_KEY = "pk_test_51Rm729GfQkMoi85mj5PvXe7k8AmUiMPTEsV6Pnxp3CWzcXc6emlYgQUwoLLa38sjOwqdJlXzI6U7lKKGCWRK9iIq00VLMXP3Tz";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export default function BookNowButton({ tourId, quantity = 1, travelDate, disabled }) {
  const [loading, setLoading] = useState(false);

  const handleBookNow = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8080/bookings/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
        body: JSON.stringify({
          tourId,
          quantity,
          travelDate,
        }),
      });
      const result = await response.json();
      // Use checkoutUrl from backend response
      const checkoutUrl = result.data?.checkoutUrl;
      if (result.code !== 0 || !checkoutUrl) throw new Error(result.msg || "Failed to create payment session");
      window.open(checkoutUrl, "_blank"); // Open Stripe checkout in new tab
    } catch (err) {
      alert("Payment error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleBookNow}
      disabled={loading || disabled}
      fullWidth
    >
      {loading ? <CircularProgress size={24} /> : "Book Now"}
    </Button>
  );
} 