import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";

export default function PaymentDetailsModal({ open, handleClose, bookingId, token }) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!bookingId) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/payments/booking/${bookingId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });
        const data = await res.json();
        if (data.code === 0) {
          setPaymentData(data.data);
        } else {
          setPaymentData(null);
          console.error("Payment fetch error:", data.msg);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setPaymentData(null);
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchPaymentDetails();
  }, [open, bookingId, token]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock
      disableEscapeKeyDown
    >
      <DialogTitle>Payment Details</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <CircularProgress data-testid="loading-spinner" />
        ) : paymentData ? (
          <div data-testid="payment-details">
            <Typography data-testid="reference">
              <strong>Reference:</strong> {paymentData.bookingReference}
            </Typography>
            <Typography data-testid="amount">
              <strong>Amount:</strong> ${paymentData.amount} {paymentData.currency}
            </Typography>
            <Typography data-testid="status">
              <strong>Status:</strong> {paymentData.status}
            </Typography>
            <Typography data-testid="method">
              <strong>Method:</strong> {paymentData.paymentMethod}
            </Typography>
            <Typography data-testid="paid-at">
              <strong>Paid At:</strong> {paymentData.paidAt ? new Date(paymentData.paidAt).toLocaleString() : "—"}
            </Typography>
            <Typography data-testid="user-email">
              <strong>User Email:</strong> {paymentData.userEmail}
            </Typography>
            <Typography data-testid="refunded">
              <strong>Refunded:</strong> ${paymentData.refundAmount}
            </Typography>
          </div>
        ) : (
          <Typography data-testid="no-payment-message">No payment found for this booking.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose} data-testid="close-button">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}