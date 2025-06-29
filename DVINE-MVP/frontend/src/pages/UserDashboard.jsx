import { useEffect, useState } from "react";
import propTypes from "prop-types";
import axios from "axios";
import  { Header } from "../components/Header";

export function UserDashboard(props) {
    const tokenValue = localStorage.getItem("token");
    const [userInfo, setUserInfo] = useState(null);
    const token = props.token;
     const fetchUserInfo = async () => {
        try { 
            const response = await axios.get('/users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
        });
        if (response.data.code === 0) {
            setUserInfo(response.data.data);
            console.log("User Info:", response.data.data);
        } else {
            // Handle error case
        }
        } catch (error) {
            // Handle error
        }
   };
    useEffect(() => {
        fetchUserInfo();
   }, []);


   return (
    <>
        <Header />
    </>
   );
};