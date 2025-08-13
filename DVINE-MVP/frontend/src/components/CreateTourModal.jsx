import React from "react";
import {
    Box,
    Button,
    Typography,
    Modal,
    TextField,
    Autocomplete,
} from "@mui/material";
import CreateTours from "../endpoints/CreateTours";
import CreateTourForm from "./CreateTourForm";
import PropTypes from "prop-types";

export function CreateTourModal({ open, onClose, catalogueList }) {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    borderRadius: 2,
                }}
            >
                <CreateTourForm
                    onClose={onClose}
                    catalogueList={catalogueList}
                />
            </Box>
        </Modal>
    );
}

CreateTourModal.PropTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    catalogueList: PropTypes.array,
};
