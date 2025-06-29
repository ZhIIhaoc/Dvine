import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function DashboardHeaderCard() {
    const navigate = useNavigate();
  return (
    <Box
      sx={{
        border: "2px black solid",
        borderRadius: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        my: 10,
        backgroundColor: "white",
        width: "70%",
        mx: "auto",
        
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <Button onClick={() => navigate("/upcomming-tours")}>Future Tours</Button>
        <Button onClick={() => navigate("/tours-history")}>Tour History</Button>
        <Button onClick={() => navigate("/purchase-history")}>Purchases</Button>
        <Button onClick={() => navigate("/support")}>Support</Button>
      </Box>
    </Box>

  );
}