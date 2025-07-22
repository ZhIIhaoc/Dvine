import React from 'react';
import { useParams } from 'react-router-dom';

const TourPurchasesSuccess = () => {
    const [bookingInfo, setBookingInfo] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const { id } = useParams(); // id is bookingId

    React.useEffect(() => {
        const fetchBookingInfo = async () => {
            try {
                const response = await fetch(`http://localhost:8080/bookings/${id}`);
                const result = await response.json();
                if (result.code === 0) {
                    setBookingInfo(result.data);
                }
            } catch (error) {
                console.error("Error fetching booking information:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookingInfo();
    }, [id]);

    if (loading) return <div className="flex flex-col items-center justify-center h-screen bg-gray-100"><p>Loading...</p></div>;
    if (!bookingInfo) return <div className="flex flex-col items-center justify-center h-screen bg-gray-100"><p>Booking not found.</p></div>;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-green-600 mb-4">Purchase Successful!</h1>
            <p className="text-lg text-gray-700 mb-2">Thank you for your purchase. Your tour is confirmed.</p>
            <div className="bg-white rounded shadow p-6 mt-4 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-2">Booking Details</h2>
                <p><strong>Booking Reference:</strong> {bookingInfo.bookingReference}</p>
                <p><strong>Tour:</strong> {bookingInfo.tourTitle || bookingInfo.tourId}</p>
                <p><strong>Date:</strong> {bookingInfo.travelDate}</p>
                <p><strong>Quantity:</strong> {bookingInfo.quantity}</p>
                <p><strong>Total Amount:</strong> ${bookingInfo.totalAmount}</p>
                <p><strong>Status:</strong> {bookingInfo.status}</p>
            </div>
        </div>
    );
}

export default TourPurchasesSuccess;