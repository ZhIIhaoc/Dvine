import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Typography,
    Button,
    Chip,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Fab,
    Tooltip,
    Divider,
    CardActions,
    Rating,
    Badge,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Star as StarIcon,
    LocationOn as LocationIcon,
    AttachMoney as PriceIcon,
    Person as PersonIcon,
    Category as CategoryIcon,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import {
    fetchCatalogues,
    fetchAllTours,
    fetchFeaturedTours,
    createCatalogue,
    updateCatalogue,
    deleteCatalogue,
} from "../endpoints/CatalogueEndpoints";
import CatalogueSearch from "../components/CatalogueSearch";
import FeaturedCarousel from "../components/FeaturedCarousel";

// Mock data for fallback
const mockTours = [
    {
        tourId: 1,
        title: "Coffs Harbour Adventure",
        destination: "Coffs Harbour, NSW",
        description: "Experience the stunning coastline and vibrant marine life of Coffs Harbour.",
        price: 299.99,
        primaryImageUrl: "/src/assets/coffs_harbour.png",
        catalogueId: 1,
        catalogueTitle: "Adventure Collection",
        creatorNickName: "DVINE Team",
    },
    {
        tourId: 2,
        title: "Port Macquarie Sights Tour",
        destination: "Port Macquarie, NSW",
        description: "Discover the historic landmarks and beautiful beaches of Port Macquarie.",
        price: 199.99,
        primaryImageUrl: "/src/assets/port_macquarie.jpg",
        catalogueId: 1,
        catalogueTitle: "Adventure Collection",
        creatorNickName: "DVINE Team",
    },
    {
        tourId: 3,
        title: "VIP EXPERIENCE – The Ultimate Luxury Getaway",
        destination: "Multiple Locations",
        description: "Exclusive luxury experience with premium accommodations and personalized service.",
        price: 1299.99,
        primaryImageUrl: "/src/assets/vip_experience.jpg",
        catalogueId: 1,
        catalogueTitle: "Luxury Collection",
        creatorNickName: "DVINE Team",
    },
];

const mockCatalogues = [
    {
        catalogueId: 1,
        title: "Adventure Collection",
        description: "Thrilling outdoor experiences and adventure tours",
        type: 0,
        coverImage: "/src/assets/coffs_harbour.png",
        creatorId: 1,
        creatorNickName: "DVINE Team",
        tourCount: 2,
    },
    {
        catalogueId: 2,
        title: "Luxury Collection",
        description: "Premium experiences with exclusive accommodations",
        type: 0,
        coverImage: "/src/assets/vip_experience.jpg",
        creatorId: 1,
        creatorNickName: "DVINE Team",
        tourCount: 1,
    },
];

export function Catalogue() {
    const [catalogues, setCatalogues] = useState([]);
    const [tours, setTours] = useState([]);
    const [featuredTours, setFeaturedTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCatalogue, setSelectedCatalogue] = useState(null);
    const [createCatalogueOpen, setCreateCatalogueOpen] = useState(false);
    const [editCatalogueOpen, setEditCatalogueOpen] = useState(false);
    const [catalogueForm, setCatalogueForm] = useState({
        title: "",
        description: "",
        coverImage: "",
        type: 1,
    });
    const [editingCatalogue, setEditingCatalogue] = useState(null);
    const [filteredTours, setFilteredTours] = useState([]);
    const [searchFilters, setSearchFilters] = useState({});
    
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const token = localStorage.getItem("accessToken");

    // Fetch catalogues from API
    const fetchCataloguesData = async () => {
        try {
            const result = await fetchCatalogues(token);
            if (result.code === 0) {
                setCatalogues(result.data);
            } else {
                // Fallback to mock data
                setCatalogues(mockCatalogues);
            }
        } catch (error) {
            console.error("Error fetching catalogues:", error);
            setCatalogues(mockCatalogues);
        }
    };

    // Fetch tours from API
    const fetchToursData = async () => {
        try {
            const result = await fetchAllTours(token);
            if (result.code === 0) {
                setTours(result.data);
            } else {
                // Fallback to mock data
                setTours(mockTours);
            }
        } catch (error) {
            console.error("Error fetching tours:", error);
            setTours(mockTours);
        } finally {
            setLoading(false);
        }
    };

    // Fetch featured tours from API
    const fetchFeaturedToursData = async () => {
        try {
            const result = await fetchFeaturedTours(token);
            if (result.code === 0) {
                setFeaturedTours(result.data);
            } else {
                // Fallback to first 6 tours if no featured tours
                setFeaturedTours([]);
            }
        } catch (error) {
            console.error("Error fetching featured tours:", error);
            setFeaturedTours([]);
        }
    };

    useEffect(() => {
        fetchCataloguesData();
        fetchToursData();
        fetchFeaturedToursData();
    }, []);

    // Create new catalogue
    const handleCreateCatalogue = async () => {
        try {
            const result = await createCatalogue(catalogueForm, token);
            if (result.code === 0) {
                setCreateCatalogueOpen(false);
                setCatalogueForm({ title: "", description: "", coverImage: "", type: 1 });
                fetchCataloguesData(); // Refresh the list
            } else {
                setError("Failed to create catalogue");
            }
        } catch (error) {
            console.error("Error creating catalogue:", error);
            setError("Failed to create catalogue");
        }
    };

    // Update catalogue
    const handleUpdateCatalogue = async () => {
        try {
            const result = await updateCatalogue({
                ...catalogueForm,
                catalogueId: editingCatalogue.catalogueId,
            }, token);
            if (result.code === 0) {
                setEditCatalogueOpen(false);
                setEditingCatalogue(null);
                setCatalogueForm({ title: "", description: "", coverImage: "", type: 1 });
                fetchCataloguesData(); // Refresh the list
            } else {
                setError("Failed to update catalogue");
            }
        } catch (error) {
            console.error("Error updating catalogue:", error);
            setError("Failed to update catalogue");
        }
    };

    // Delete catalogue
    const handleDeleteCatalogue = async (catalogueId) => {
        if (!window.confirm("Are you sure you want to delete this catalogue? All tours in this catalogue will also be deleted.")) {
            return;
        }

        try {
            const result = await deleteCatalogue(catalogueId, token);
            if (result.code === 0) {
                fetchCataloguesData();
                fetchToursData();
            } else {
                setError("Failed to delete catalogue");
            }
        } catch (error) {
            console.error("Error deleting catalogue:", error);
            setError("Failed to delete catalogue");
        }
    };

    // Open edit catalogue dialog
    const handleEditCatalogue = (catalogue) => {
        setEditingCatalogue(catalogue);
        setCatalogueForm({
            title: catalogue.title,
            description: catalogue.description,
            coverImage: catalogue.coverImage,
            type: catalogue.type,
        });
        setEditCatalogueOpen(true);
    };

    // Filter tours by catalogue
    const getToursByCatalogue = (catalogueId) => {
        return tours.filter(tour => tour.catalogueId === catalogueId);
    };

    // Get catalogue type label
    const getCatalogueTypeLabel = (type) => {
        return type === 0 ? "Official" : "Partner";
    };

    // Get catalogue type color
    const getCatalogueTypeColor = (type) => {
        return type === 0 ? "primary" : "secondary";
    };

    // Handle search and filtering
    const handleSearch = (filters) => {
        setSearchFilters(filters);
        let filtered = [...tours];

        // Filter by search term
        if (filters.searchTerm) {
            filtered = filtered.filter(tour =>
                tour.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                tour.destination.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                tour.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Filter by catalogue
        if (filters.catalogueId) {
            filtered = filtered.filter(tour => tour.catalogueId === parseInt(filters.catalogueId));
        }

        // Filter by price range
        filtered = filtered.filter(tour => 
            tour.price >= filters.priceRange[0] && tour.price <= filters.priceRange[1]
        );

        // Filter by location (destination)
        if (filters.location) {
            filtered = filtered.filter(tour =>
                tour.destination && tour.destination.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Filter by duration (if available)
        if (filters.duration && tour.duration) {
            const durationDays = parseInt(filters.duration);
            filtered = filtered.filter(tour => {
                const tourDuration = tour.duration ? parseInt(tour.duration.split(' ')[0]) : 1;
                return tourDuration >= durationDays;
            });
        }

        setFilteredTours(filtered);
    };

    const handleClearSearch = () => {
        setSearchFilters({});
        setFilteredTours([]);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", py: 4, px: { xs: 2, sm: 4, md: 8 } }}>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h2" color="primary" gutterBottom>
                    DVINE Catalogue
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Discover amazing tours and experiences
                </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Catalogue Management for Admin/Partners */}
            {isAuthenticated && (user?.permission >= 2) && (
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold">
                            Manage Catalogues
                    </Typography>
                        <Tooltip title="Create New Catalogue">
                            <Fab
                                color="primary"
                                size="medium"
                                onClick={() => setCreateCatalogueOpen(true)}
                                sx={{ ml: 2 }}
                            >
                                <AddIcon />
                            </Fab>
                        </Tooltip>
                    </Box>

                    {/* Catalogue Cards */}
                    <Grid container spacing={3}>
                        {catalogues.map((catalogue) => (
                            <Grid item xs={12} sm={6} md={4} key={catalogue.catalogueId}>
                                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                        <CardMedia
                                            component="img"
                                        height="200"
                                        image={catalogue.coverImage || "/src/assets/logo.png"}
                                        alt={catalogue.title}
                                        sx={{ objectFit: "cover" }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                                                {catalogue.title}
                                            </Typography>
                                            <Chip
                                                label={getCatalogueTypeLabel(catalogue.type)}
                                                color={getCatalogueTypeColor(catalogue.type)}
                                                size="small"
                                            />
                    </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {catalogue.description}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                            <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {catalogue.creatorNickName}
                                            </Typography>
                </Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <CategoryIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {getToursByCatalogue(catalogue.catalogueId).length} tours
                    </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                                        <Button
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() => setSelectedCatalogue(catalogue)}
                                        >
                                            View Tours
                                        </Button>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditCatalogue(catalogue)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteCatalogue(catalogue.catalogueId)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Featured Tours Carousel */}
            <FeaturedCarousel 
                tours={featuredTours.length > 0 ? featuredTours : tours.slice(0, 6)}
                onTourClick={(tourId) => navigate(`/tour/${tourId}`)}
            />

            {/* Search and Filter Section */}
            <CatalogueSearch onSearch={handleSearch} onClear={handleClearSearch} />

            {/* All Tours Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    {Object.keys(searchFilters).length > 0 && filteredTours.length > 0 
                        ? `Search Results (${filteredTours.length} tours found)`
                        : "All Available Tours"
                    }
                </Typography>
                <Grid container spacing={3} justifyContent="center">
                    {(filteredTours.length > 0 ? filteredTours : tours).map((tour) => (
                        <Grid item xs={12} sm={6} md={4} key={tour.tourId}>
                            <Card 
                sx={{
                                    height: "100%", 
                    display: "flex",
                    flexDirection: "column",
                                    cursor: "pointer",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 4,
                                    }
                                }}
                                onClick={() => navigate(`/tour/${tour.tourId}`)}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={tour.primaryImageUrl || tour.image || "/src/assets/logo.png"}
                                    alt={tour.title}
                                    sx={{ objectFit: "cover" }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {tour.title}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {tour.destination}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {tour.description}
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <PriceIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                ${tour.price}
                                            </Typography>
                                        </Box>
                                        <Rating value={4.5} readOnly size="small" />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Create Catalogue Dialog */}
            <Dialog open={createCatalogueOpen} onClose={() => setCreateCatalogueOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Catalogue</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Catalogue Title"
                        value={catalogueForm.title}
                        onChange={(e) => setCatalogueForm({ ...catalogueForm, title: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={catalogueForm.description}
                        onChange={(e) => setCatalogueForm({ ...catalogueForm, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Cover Image URL"
                        value={catalogueForm.coverImage}
                        onChange={(e) => setCatalogueForm({ ...catalogueForm, coverImage: e.target.value })}
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Catalogue Type</InputLabel>
                        <Select
                            value={catalogueForm.type}
                            onChange={(e) => setCatalogueForm({ ...catalogueForm, type: e.target.value })}
                            label="Catalogue Type"
                        >
                            <MenuItem value={0}>Official Catalogue</MenuItem>
                            <MenuItem value={1}>Partner Catalogue</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateCatalogueOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateCatalogue} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Catalogue Dialog */}
            <Dialog open={editCatalogueOpen} onClose={() => setEditCatalogueOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Catalogue</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Catalogue Title"
                        value={catalogueForm.title}
                        onChange={(e) => setCatalogueForm({ ...catalogueForm, title: e.target.value })}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={catalogueForm.description}
                        onChange={(e) => setCatalogueForm({ ...catalogueForm, description: e.target.value })}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Cover Image URL"
                        value={catalogueForm.coverImage}
                        onChange={(e) => setCatalogueForm({ ...catalogueForm, coverImage: e.target.value })}
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Catalogue Type</InputLabel>
                        <Select
                            value={catalogueForm.type}
                            onChange={(e) => setCatalogueForm({ ...catalogueForm, type: e.target.value })}
                            label="Catalogue Type"
                        >
                            <MenuItem value={0}>Official Catalogue</MenuItem>
                            <MenuItem value={1}>Partner Catalogue</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditCatalogueOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateCatalogue} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>

            {/* Selected Catalogue Tours Dialog */}
            <Dialog 
                open={!!selectedCatalogue} 
                onClose={() => setSelectedCatalogue(null)} 
                maxWidth="lg" 
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6">{selectedCatalogue?.title} - Tours</Typography>
                        <Chip
                            label={selectedCatalogue ? getCatalogueTypeLabel(selectedCatalogue.type) : ""}
                            color={selectedCatalogue ? getCatalogueTypeColor(selectedCatalogue.type) : "default"}
                        />
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {selectedCatalogue?.description}
                    </Typography>
                    <Grid container spacing={2}>
                        {selectedCatalogue && getToursByCatalogue(selectedCatalogue.catalogueId).map((tour) => (
                            <Grid item xs={12} sm={6} key={tour.tourId}>
                                <Card 
                                    sx={{ 
                                        cursor: "pointer",
                                        transition: "transform 0.2s",
                                        "&:hover": { transform: "scale(1.02)" }
                                    }}
                                    onClick={() => {
                                        navigate(`/tour/${tour.tourId}`);
                                        setSelectedCatalogue(null);
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="150"
                                        image={tour.primaryImageUrl || tour.image || "/src/assets/logo.png"}
                                        alt={tour.title}
                                        sx={{ objectFit: "cover" }}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {tour.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {tour.destination}
                                        </Typography>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                ${tour.price}
                                            </Typography>
                                            <Rating value={4.5} readOnly size="small" />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCatalogue(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}