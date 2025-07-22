import { Modal, Box } from "@mui/material";
import CreateCatalogueForm from "./CreateCatalogueForm.jsx";

export default function CreateCatalogueModal(props) {
    const { open, onClose, ...rest } = props;
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
                <CreateCatalogueForm onClose={onClose} {...rest} />
            </Box>
        </Modal>
    );
}
