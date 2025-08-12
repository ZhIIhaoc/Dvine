import { Box, Modal } from "@mui/material";
import UserListForm from "./UserListForm.jsx";
import PropTypes from "prop-types";

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

UserListModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
};
