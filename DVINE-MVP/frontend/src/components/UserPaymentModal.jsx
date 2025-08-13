import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export default function UserPaymentsModal({
    open,
    handleClose,
    userId,
    token,
}) {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `http://localhost:8080/payments/user/${userId}`,
                    {
                        headers: {
                            Authorization: token,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = await res.json();
                if (data.code === 0) {
                    setPayments(data.data);
                } else {
                    setPayments([]);
                }
            } catch (err) {
                console.error("Error fetching payments:", err);
                setPayments([]);
            } finally {
                setLoading(false);
            }
        };

        if (open && userId) {
            fetchPayments();
        }
    }, [open, userId]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            disableScrollLock
        >
            <DialogTitle>User Payment History</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <CircularProgress />
                ) : payments.length === 0 ? (
                    <Typography>No payments found for this user.</Typography>
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
                                            {payment.tourTitle} -{" "}
                                            {payment.amount} {payment.currency}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                <strong>Booking Ref:</strong>{" "}
                                                {payment.bookingReference}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                <strong>Destination:</strong>{" "}
                                                {payment.tourDestination}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                <strong>Paid At:</strong>{" "}
                                                {payment.paidAt
                                                    ? new Date(
                                                          payment.paidAt
                                                      ).toLocaleString()
                                                    : "—"}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

UserPaymentsModal.propTypes = {
    open: PropTypes.bool,
    handleClose: PropTypes.func,
    userId: PropTypes.number,
    token: PropTypes.string,
};
