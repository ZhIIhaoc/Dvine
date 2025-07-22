import { useEffect, useState, useContext } from "react";
import {
    Box,
    Button,
    Typography,
    Modal,
    List,
    ListItem,
    ListItemText,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import UserListForm from "./UserListForm.jsx";

export default function UserListModal({ open, onClose }) {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    borderRadius: 2,
                }}
            >
                <UserListForm onClose={onClose} />
            </Box>
        </Modal>
    );
}
