import {
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Box,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

/**
 * features the current users payment history.
 *
 */
export default function MyPayments() {
    const { token } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchMyPayments = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    "http://localhost:8080/payments/my-payments",
                    {
                        headers: {
                            Authorization: token,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const responseInfo = await res.json();
                if (responseInfo.code === 0) {
                    setPayments(responseInfo.data);
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
            <Typography variant="h6" sx={{ mt: 2 }}>
                My Payment History
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : payments.length === 0 ? (
                <Typography sx={{ mt: 3 }}>
                    No payments found for your account.
                </Typography>
            ) : (
                <List>
                    {payments.map((payment) => (
                        <ListItem key={payment.paymentId} divider>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        [{payment.status}]{" "}
                                        {payment.bookingReference} -{" "}
                                        {payment.amount} {payment.currency}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            <strong>Paid At:</strong>{" "}
                                            {new Date(
                                                payment.paidAt
                                            ).toLocaleString(undefined, {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            <strong>Payment Method:</strong>{" "}
                                            {payment.paymentMethod}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            <strong>Refunded:</strong> $
                                            {payment.refundAmount}
                                        </Typography>
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
