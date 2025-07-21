import React from 'react';
import { useParams } from 'react-router-dom';


const TourPurchaseFail = () => {
    const [pageInfo, setPageInfo] = React.useState({});
    const [gottenInfo, setGottenInfo] = React.useState(false);
    const { id } = useParams();
    const getToursInfo = async () => {
        // Fetch tour information using the tour ID
        try {
            const localHost = "http://localhost:8080";
        const response = await fetch(`${localHost}/tours/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const responseInfo = await response.json();
        if (responseInfo.code === 0) {
            setPageInfo(responseInfo.data);
            setGottenInfo(true);
        }
        } catch (error) {
            console.error("Error fetching tour information:", error);
        }
    }
    React.useEffect(() => {
        getToursInfo();
    }, [id]);

    return (
        <>
        {gottenInfo && (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Purchase Failed! for Tour ID: {pageInfo.title}</h1>
            <p className="text-lg text-gray-700 mb-6">We're sorry, but your purchase could not be completed.</p>
        </div>
        )}
        </>
    );
}

export default TourPurchaseFail;