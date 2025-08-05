import {
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx"; // adjust path as needed

export default function MyPayments() {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchMyPayments = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/payments/my-payments", {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.code === 0) {
          setPayments(data.data);
        } else {
          setPayments([]);
        }
      } catch (err) {
        console.error("Error fetching current user's payments:", err);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPayments();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Payment History
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : payments.length === 0 ? (
        <Typography>No payments found for your account.</Typography>
      ) : (
        <List>
          {payments.map((payment) => (
            <ListItem key={payment.paymentId} divider>
              <ListItemText
                primary={`[${payment.status}] ${payment.bookingReference} - ${payment.amount} ${payment.currency}`}
                secondary={
                  <>
                    <div><strong>Paid At:</strong> {new Date(payment.paidAt).toLocaleString()}</div>
                    <div><strong>Payment Method:</strong> {payment.paymentMethod}</div>
                    <div><strong>Refunded:</strong> ${payment.refundAmount}</div>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}