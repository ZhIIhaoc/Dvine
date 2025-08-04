import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    CircularProgress,
    Fab,
    Tooltip,
    Paper,
    Grid,
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import { useAuth } from "../components/AuthContext";

// FAQ API endpoints
const BASE_URL = "http://localhost:8080";

const fetchFAQs = async () => {
    try {
        const response = await fetch(`${BASE_URL}/faqs`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        throw error;
    }
};

const createFAQ = async (faqData) => {
    try {
        const response = await fetch(`${BASE_URL}/faqs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(faqData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating FAQ:", error);
        throw error;
    }
};

const updateFAQ = async (faqData) => {
    try {
        const response = await fetch(`${BASE_URL}/faqs`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(faqData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating FAQ:", error);
        throw error;
    }
};

const deleteFAQ = async (faqId) => {
    try {
        const response = await fetch(`${BASE_URL}/faqs/${faqId}`, {
            method: "DELETE",
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        throw error;
    }
};

export function FAQ() {
    const [faqs, setFaqs] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [faqForm, setFaqForm] = useState({
        question: "",
        answer: "",
    });

    const { userInfo, token } = useAuth();
    const isAdmin = userInfo?.permission >= 4;

    // Fetch FAQs from API
    const fetchFAQsData = async () => {
        try {
            const result = await fetchFAQs();
            if (result.code === 0) {
                setFaqs(result.data);
                setFilteredFaqs(result.data);
            } else {
                setError("Failed to fetch FAQs");
            }
        } catch (error) {
            console.error("Error fetching FAQs:", error);
            setError("Failed to fetch FAQs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQsData();
    }, []);

    // Handle search
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredFaqs(faqs);
        } else {
            const filtered = faqs.filter(
                (faq) =>
                    faq.question
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFaqs(filtered);
        }
    }, [searchTerm, faqs]);

    // Create new FAQ
    const handleCreateFAQ = async () => {
        try {
            const result = await createFAQ(faqForm);
            if (result.code === 0) {
                setCreateDialogOpen(false);
                setFaqForm({ question: "", answer: "" });
                fetchFAQsData(); // Refresh the list
            } else {
                setError("Failed to create FAQ");
            }
        } catch (error) {
            console.error("Error creating FAQ:", error);
            setError("Failed to create FAQ");
        }
    };

    // Update FAQ
    const handleUpdateFAQ = async () => {
        try {
            const result = await updateFAQ({
                ...faqForm,
                faqId: editingFaq.faqId,
            });
            if (result.code === 0) {
                setEditDialogOpen(false);
                setEditingFaq(null);
                setFaqForm({ question: "", answer: "" });
                fetchFAQsData(); // Refresh the list
            } else {
                setError("Failed to update FAQ");
            }
        } catch (error) {
            console.error("Error updating FAQ:", error);
            setError("Failed to update FAQ");
        }
    };

    // Delete FAQ
    const handleDeleteFAQ = async (faqId) => {
        if (!window.confirm("Are you sure you want to delete this FAQ?")) {
            return;
        }

        try {
            const result = await deleteFAQ(faqId);
            if (result.code === 0) {
                fetchFAQsData();
            } else {
                setError("Failed to delete FAQ");
            }
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            setError("Failed to delete FAQ");
        }
    };

    // Open edit dialog
    const handleEditFAQ = (faq) => {
        setEditingFaq(faq);
        setFaqForm({
            question: faq.question,
            answer: faq.answer,
        });
        setEditDialogOpen(true);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", py: 4, px: { xs: 2, sm: 4, md: 8 } }}>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h3" color="text.tertiary" gutterBottom>
                    Frequently Asked Questions
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Find answers to common questions about our tours and
                    services
                </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {/* Debug Info - Remove this after testing */}
            {userInfo && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Debug: User permission level: {userInfo.permission}{" "}
                    (isAdmin: {isAdmin ? "true" : "false"})
                </Alert>
            )}

            {/* Search Bar */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                        fullWidth
                        label="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon
                                    sx={{ mr: 1, color: "text.primary" }}
                                />
                            ),
                        }}
                        InputLabelProps={{
                            sx: {
                                color: "text.primary",
                            },
                        }}
                    />
                    {isAdmin && (
                        <Tooltip title="Add New FAQ">
                            <Fab
                                color="primary"
                                size="medium"
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                <AddIcon />
                            </Fab>
                        </Tooltip>
                    )}
                </Box>
            </Paper>

            {/* FAQs List */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    {searchTerm
                        ? `Search Results (${filteredFaqs.length} FAQs found)`
                        : "All FAQs"}
                </Typography>

                {filteredFaqs.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            {searchTerm
                                ? "No FAQs found matching your search."
                                : "No FAQs available."}
                        </Typography>
                    </Box>
                ) : (
                    filteredFaqs.map((faq) => (
                        <Accordion key={faq.faqId} sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography
                                    variant="h6"
                                    fontWeight="medium"
                                    sx={{ flexGrow: 1 }}
                                >
                                    {faq.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        width: "100%",
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        color="text.primary"
                                        sx={{ lineHeight: 1.6, flexGrow: 1 }}
                                    >
                                        {faq.answer}
                                    </Typography>
                                    {isAdmin && (
                                        <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditFAQ(faq)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteFAQ(faq.faqId)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Box>

            {/* Create FAQ Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Create New FAQ</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Question"
                        value={faqForm.question}
                        onChange={(e) =>
                            setFaqForm({ ...faqForm, question: e.target.value })
                        }
                        margin="normal"
                        required
                        multiline
                        rows={2}
                    />
                    <TextField
                        fullWidth
                        label="Answer"
                        value={faqForm.answer}
                        onChange={(e) =>
                            setFaqForm({ ...faqForm, answer: e.target.value })
                        }
                        margin="normal"
                        required
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateFAQ} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit FAQ Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit FAQ</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Question"
                        value={faqForm.question}
                        onChange={(e) =>
                            setFaqForm({ ...faqForm, question: e.target.value })
                        }
                        margin="normal"
                        required
                        multiline
                        rows={2}
                    />
                    <TextField
                        fullWidth
                        label="Answer"
                        value={faqForm.answer}
                        onChange={(e) =>
                            setFaqForm({ ...faqForm, answer: e.target.value })
                        }
                        margin="normal"
                        required
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateFAQ} variant="contained">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
