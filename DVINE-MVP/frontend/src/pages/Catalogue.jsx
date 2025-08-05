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
    useTheme,
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
    deleteTour,
    updateTour,
} from "../endpoints/CatalogueEndpoints";
import CatalogueSearch from "../components/CatalogueSearch";
import FeaturedCarousel from "../components/FeaturedCarousel";
import PriceDisplay from "../components/PriceDisplay";
import TourImageUpload from "../components/TourImageUpload";
import removeMarkdown from "remove-markdown";
import MDEditor from "@uiw/react-md-editor";

// Mock data for fallback
const mockTours = [
    {
        tourId: 1,
        title: "Coffs Harbour Adventure",
        destination: "Coffs Harbour, NSW",
        description:
            "Experience the stunning coastline and vibrant marine life of Coffs Harbour.",
        regularPrice: 299.99,
        primaryImageUrl: "/src/assets/coffs_harbour.png",
        catalogueId: 1,
        catalogueTitle: "Adventure Collection",
        creatorNickName: "DVINE Team",
    },
    {
        tourId: 2,
        title: "Port Macquarie Sights Tour",
        destination: "Port Macquarie, NSW",
        description:
            "Discover the historic landmarks and beautiful beaches of Port Macquarie.",
        regularPrice: 199.99,
        primaryImageUrl: "/src/assets/port_macquarie.jpg",
        catalogueId: 1,
        catalogueTitle: "Adventure Collection",
        creatorNickName: "DVINE Team",
    },
    {
        tourId: 3,
        title: "VIP EXPERIENCE – The Ultimate Luxury Getaway",
        destination: "Multiple Locations",
        description:
            "Exclusive luxury experience with premium accommodations and personalized service.",
        regularPrice: 1299.99,
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
    const theme = useTheme();
    const [catalogueForm, setCatalogueForm] = useState({
        title: "",
        description: "",
        coverImage: "",
        type: 1,
    });
    const [editingCatalogue, setEditingCatalogue] = useState(null);
    const [filteredTours, setFilteredTours] = useState([]);
    const [searchFilters, setSearchFilters] = useState({});
    const [editTourOpen, setEditTourOpen] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [tourForm, setTourForm] = useState({
        title: "",
        description: "",
        destination: "",
        catalogueId: 1, // Add catalogueId with default value
        regularPrice: "",
        premiumPrice: "",
        primaryImageUrl: "",
        images: [],
    });

    const navigate = useNavigate();
    const { user, isAuthenticated, userInfo } = useAuth();
    const token = localStorage.getItem("accessToken");

    // Fetch catalogues from API
    const fetchCataloguesData = async () => {
        try {
            const result = await fetchCatalogues();
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
            const result = await fetchAllTours();
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
            const result = await fetchFeaturedTours();
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
    // useEffect(() => {
    //     console.log("Catalogues:", catalogues);
    //     console.log("Tours:", tours);
    // }, [catalogues, tours]);

    // Create new catalogue
    const handleCreateCatalogue = async () => {
        try {
            const result = await createCatalogue(catalogueForm);
            if (result.code === 0) {
                setCreateCatalogueOpen(false);
                setCatalogueForm({
                    title: "",
                    description: "",
                    coverImage: "",
                    type: 1,
                });
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
            const result = await updateCatalogue(
                {
                    ...catalogueForm,
                    catalogueId: editingCatalogue.catalogueId,
                },
                token
            );
            if (result.code === 0) {
                setEditCatalogueOpen(false);
                setEditingCatalogue(null);
                setCatalogueForm({
                    title: "",
                    description: "",
                    coverImage: "",
                    type: 1,
                });
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
        if (
            !window.confirm(
                "Are you sure you want to delete this catalogue? All tours in this catalogue will also be deleted."
            )
        ) {
            return;
        }

        try {
            const result = await deleteCatalogue(catalogueId);
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

    // Delete tour
    const handleDeleteTour = async (tourId) => {
        if (!window.confirm("Are you sure you want to delete this tour?")) {
            return;
        }

        try {
            const result = await deleteTour(tourId);
            if (result.code === 0) {
                fetchToursData();
            } else {
                setError("Failed to delete tour");
            }
        } catch (error) {
            console.error("Error deleting tour:", error);
            setError("Failed to delete tour");
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
        return tours.filter((tour) => tour.catalogueId === catalogueId);
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
            filtered = filtered.filter(
                (tour) =>
                    tour.title
                        .toLowerCase()
                        .includes(filters.searchTerm.toLowerCase()) ||
                    tour.destination
                        .toLowerCase()
                        .includes(filters.searchTerm.toLowerCase()) ||
                    tour.description
                        .toLowerCase()
                        .includes(filters.searchTerm.toLowerCase())
            );
        }

        // Filter by catalogue
        if (filters.catalogueId) {
            filtered = filtered.filter(
                (tour) => tour.catalogueId === parseInt(filters.catalogueId)
            );
        }

        // Filter by price range
        filtered = filtered.filter(
            (tour) =>
                tour.regularPrice >= filters.priceRange[0] &&
                tour.regularPrice <= filters.priceRange[1]
        );

        // Filter by location (destination)
        if (filters.location) {
            filtered = filtered.filter(
                (tour) =>
                    tour.destination &&
                    tour.destination
                        .toLowerCase()
                        .includes(filters.location.toLowerCase())
            );
        }

        // Filter by duration (if available)
        if (filters.duration && tour.duration) {
            const durationDays = parseInt(filters.duration);
            filtered = filtered.filter((tour) => {
                const tourDuration = tour.duration
                    ? parseInt(tour.duration.split(" ")[0])
                    : 1;
                return tourDuration >= durationDays;
            });
        }

        setFilteredTours(filtered);
    };

    const handleClearSearch = () => {
        setSearchFilters({});
        setFilteredTours([]);
    };

    // Open edit tour dialog
    const handleEditTour = (tour) => {
        setEditingTour(tour);
        setTourForm({
            title: tour.title,
            description: tour.description,
            destination: tour.destination,
            catalogueId: tour.catalogueId || 1, // Add catalogueId with default value
            regularPrice: tour.regularPrice ?? tour.price ?? "",
            premiumPrice: tour.premiumPrice ?? tour.price ?? "",
            primaryImageUrl: tour.primaryImageUrl || "",
            images: tour.images || [],
        });
        setEditTourOpen(true);
    };
    // Update tour
    const handleUpdateTour = async () => {
        try {
            const result = await updateTour({
                ...tourForm,
                tourId: editingTour.tourId,
            });
            if (result.code === 0) {
                setEditTourOpen(false);
                setEditingTour(null);
                setTourForm({
                    title: "",
                    description: "",
                    destination: "",
                    catalogueId: 1, // Add catalogueId with default value
                    regularPrice: "",
                    premiumPrice: "",
                    primaryImageUrl: "",
                    images: [],
                });
                fetchToursData(); // Refresh the list
            } else {
                setError("Failed to update tour");
            }
        } catch (error) {
            console.error("Error updating tour:", error);
            setError("Failed to update tour");
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                px: { xs: 2, sm: 4, md: 8 },
                maxWidth: "100%",
                overflowX: "hidden",
            }}
        >
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

            {/* Catalogue Management for Admin/Partners */}
            {isAuthenticated && user?.permission >= 2 && (
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
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
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                key={catalogue.catalogueId}
                            >
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={
                                            catalogue.coverImage ||
                                            "/src/assets/logo.png"
                                        }
                                        alt={catalogue.title}
                                        sx={{ objectFit: "cover" }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                mb: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                sx={{ flexGrow: 1 }}
                                            >
                                                {catalogue.title}
                                            </Typography>
                                            <Chip
                                                label={getCatalogueTypeLabel(
                                                    catalogue.type
                                                )}
                                                color={getCatalogueTypeColor(
                                                    catalogue.type
                                                )}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            {catalogue.description}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 1,
                                            }}
                                        >
                                            <PersonIcon
                                                sx={{
                                                    fontSize: 16,
                                                    mr: 0.5,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {catalogue.creatorNickName}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <CategoryIcon
                                                sx={{
                                                    fontSize: 16,
                                                    mr: 0.5,
                                                    color: "text.secondary",
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {
                                                    getToursByCatalogue(
                                                        catalogue.catalogueId
                                                    ).length
                                                }{" "}
                                                tours
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions
                                        sx={{
                                            justifyContent: "space-between",
                                            p: 2,
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() =>
                                                setSelectedCatalogue(catalogue)
                                            }
                                        >
                                            View Tours
                                        </Button>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleEditCatalogue(
                                                        catalogue
                                                    )
                                                }
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleDeleteCatalogue(
                                                        catalogue.catalogueId
                                                    )
                                                }
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
                tours={
                    featuredTours.length > 0 ? featuredTours : tours.slice(0, 6)
                }
                onTourClick={(tourId) => navigate(`/tour/${tourId}`)}
                userPermission={userInfo?.permission ?? 0}
            />

            {/* Search and Filter Section */}
            <CatalogueSearch
                onSearch={handleSearch}
                onClear={handleClearSearch}
                sx={{ width: "100%" }}
            />

            {/* All Tours Section */}
            <Box sx={{ mb: 4, minHeight: "40vh" }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                    {Object.keys(searchFilters).length > 0 &&
                    filteredTours.length >= 0
                        ? `Search Results (${filteredTours.length} tours found)`
                        : "All Available Tours"}
                </Typography>
                <Grid
                    container
                    spacing={3}
                    sx={{
                        justifyContent: {
                            xs: "center",
                            xl: "flex-start",
                        },
                    }}
                >
                    {(filteredTours.length >= 0 ? filteredTours : tours).map(
                        (tour) => (
                            <Box
                                key={tour.tourId}
                                sx={{
                                    flexBasis: {
                                        xs: "100%",
                                        md: "45%",
                                        xl: "32%",
                                    },
                                    maxWidth: {
                                        xs: "80%",
                                        md: "45%",
                                        xl: "32%",
                                    },
                                    flexGrow: 0,
                                }}
                            >
                                <Card
                                    sx={{
                                        height: "100%",
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        cursor: "pointer",
                                        transition:
                                            "transform 0.2s, box-shadow 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: 4,
                                        },
                                    }}
                                    onClick={() =>
                                        navigate(`/tour/${tour.tourId}`)
                                    }
                                >
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={
                                            tour.primaryImageUrl ||
                                            tour.image ||
                                            "/src/assets/logo.png"
                                        }
                                        alt={tour.title}
                                        sx={{ objectFit: "cover" }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            gutterBottom
                                        >
                                            {tour.title}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 1,
                                            }}
                                        >
                                            <LocationIcon
                                                sx={{
                                                    fontSize: 16,
                                                    mr: 0.5,
                                                    color: "text.tertiary",
                                                }}
                                            />
                                            <Typography
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {tour.destination}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            sx={{
                                                mb: 4,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {removeMarkdown(tour.description)}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <PriceDisplay
                                                regularPrice={
                                                    tour.regularPrice ??
                                                    tour.price
                                                }
                                                premiumPrice={
                                                    tour.premiumPrice ??
                                                    tour.price
                                                }
                                                userPermission={
                                                    userInfo?.permission ?? 0
                                                }
                                            />
                                            <Rating
                                                value={4.5}
                                                readOnly
                                                size="small"
                                            />
                                        </Box>
                                    </CardContent>
                                    <CardActions
                                        sx={{
                                            justifyContent: "space-between",
                                            p: 2,
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            startIcon={<ViewIcon />}
                                            onClick={() =>
                                                setSelectedCatalogue(catalogue)
                                            }
                                        >
                                            View Tours
                                        </Button>
                                        <Box>
                                            {userInfo?.permission >= 2 && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditTour(tour);
                                                    }}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTour(
                                                        tour.tourId
                                                    );
                                                }}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </CardActions>
                                </Card>
                            </Box>
                        )
                    )}
                </Grid>
            </Box>

            {/* Create Catalogue Dialog */}
            <Dialog
                open={createCatalogueOpen}
                onClose={() => setCreateCatalogueOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create New Catalogue</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Catalogue Title"
                        value={catalogueForm.title}
                        onChange={(e) =>
                            setCatalogueForm({
                                ...catalogueForm,
                                title: e.target.value,
                            })
                        }
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={catalogueForm.description}
                        onChange={(e) =>
                            setCatalogueForm({
                                ...catalogueForm,
                                description: e.target.value,
                            })
                        }
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Cover Image URL"
                        value={catalogueForm.coverImage}
                        onChange={(e) =>
                            setCatalogueForm({
                                ...catalogueForm,
                                coverImage: e.target.value,
                            })
                        }
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Catalogue Type</InputLabel>
                        <Select
                            value={catalogueForm.type}
                            onChange={(e) =>
                                setCatalogueForm({
                                    ...catalogueForm,
                                    type: e.target.value,
                                })
                            }
                            label="Catalogue Type"
                        >
                            <MenuItem value={0}>Official Catalogue</MenuItem>
                            <MenuItem value={1}>Partner Catalogue</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateCatalogueOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateCatalogue} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Catalogue Dialog */}
            <Dialog
                open={editCatalogueOpen}
                onClose={() => setEditCatalogueOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Catalogue</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Catalogue Title"
                        value={catalogueForm.title}
                        onChange={(e) =>
                            setCatalogueForm({
                                ...catalogueForm,
                                title: e.target.value,
                            })
                        }
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={catalogueForm.description}
                        onChange={(e) =>
                            setCatalogueForm({
                                ...catalogueForm,
                                description: e.target.value,
                            })
                        }
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <TextField
                        fullWidth
                        label="Cover Image URL"
                        value={catalogueForm.coverImage}
                        onChange={(e) =>
                            setCatalogueForm({
                                ...catalogueForm,
                                coverImage: e.target.value,
                            })
                        }
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Catalogue Type</InputLabel>
                        <Select
                            value={catalogueForm.type}
                            onChange={(e) =>
                                setCatalogueForm({
                                    ...catalogueForm,
                                    type: e.target.value,
                                })
                            }
                            label="Catalogue Type"
                        >
                            <MenuItem value={0}>Official Catalogue</MenuItem>
                            <MenuItem value={1}>Partner Catalogue</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditCatalogueOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateCatalogue} variant="contained">
                        Update
                    </Button>
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
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6">
                            {selectedCatalogue?.title} - Tours
                        </Typography>
                        <Chip
                            label={
                                selectedCatalogue
                                    ? getCatalogueTypeLabel(
                                          selectedCatalogue.type
                                      )
                                    : ""
                            }
                            color={
                                selectedCatalogue
                                    ? getCatalogueTypeColor(
                                          selectedCatalogue.type
                                      )
                                    : "default"
                            }
                        />
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ mb: 3 }}
                    >
                        {selectedCatalogue?.description}
                    </Typography>
                    <Grid container spacing={2}>
                        {selectedCatalogue &&
                            getToursByCatalogue(
                                selectedCatalogue.catalogueId
                            ).map((tour) => (
                                <Grid item xs={12} sm={6} key={tour.tourId}>
                                    <Card
                                        sx={{
                                            cursor: "pointer",
                                            transition: "transform 0.2s",
                                            "&:hover": {
                                                transform: "scale(1.02)",
                                            },
                                        }}
                                        onClick={() => {
                                            navigate(`/tour/${tour.tourId}`);
                                            setSelectedCatalogue(null);
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="150"
                                            image={
                                                tour.primaryImageUrl ||
                                                tour.image ||
                                                "/src/assets/logo.png"
                                            }
                                            alt={tour.title}
                                            sx={{ objectFit: "cover" }}
                                        />
                                        <CardContent>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                gutterBottom
                                            >
                                                {tour.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.primary"
                                                sx={{ mb: 1 }}
                                            >
                                                {tour.destination}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    color="primary"
                                                    fontWeight="bold"
                                                >
                                                    ${tour.regularPrice}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{ mb: 1 }}
                                                >
                                                    {tour.destination}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="h6"
                                                        color="text.primary"
                                                        fontWeight="bold"
                                                    >
                                                        ${tour.price}
                                                    </Typography>
                                                    <Rating
                                                        value={4.5}
                                                        readOnly
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedCatalogue(null)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Tour Dialog */}
            <Dialog
                open={editTourOpen}
                onClose={() => setEditTourOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Tour</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Tour Information
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Update experience details and click "Update" to
                                save changes.
                            </Typography>
                            <TextField
                                fullWidth
                                label="Title"
                                value={tourForm.title}
                                onChange={(e) =>
                                    setTourForm({
                                        ...tourForm,
                                        title: e.target.value,
                                    })
                                }
                                margin="normal"
                                required
                            />
                            {/* <TextField
                                fullWidth
                                label="Description"
                                value={tourForm.description}
                                onChange={(e) =>
                                    setTourForm({
                                        ...tourForm,
                                        description: e.target.value,
                                    })
                                }
                                margin="normal"
                                multiline
                                rows={3}
                            /> */}
                            <Typography variant="body1" gutterBottom>
                                Experience Description
                            </Typography>
                            <Box
                                data-color-mode="dark"
                                sx={{
                                    "& .w-md-editor": {
                                        backgroundColor: "background.default",
                                        border: `1px solid ${theme.palette.divider}`,
                                        "--w-md-editor-text-color":
                                            theme.palette.text.primary,
                                        "--w-md-editor-background-color":
                                            theme.palette.background.default,
                                        color:
                                            theme.palette.text.primary +
                                            " !important",
                                    },
                                    "& .w-md-editor-preview": {
                                        backgroundColor:
                                            "background.default !important",
                                        color:
                                            theme.palette.text.primary +
                                            " !important",
                                    },
                                    "& .w-md-editor-toolbar": {
                                        backgroundColor:
                                            theme.palette.background.default,
                                        borderBottom: `0.1px solid ${theme.palette.divider}`,
                                    },
                                    "& .w-md-editor-toolbar button svg path": {
                                        stroke: `${theme.palette.text.primary} !important`,
                                        fill: `${theme.palette.text.primary} !important`,
                                    },
                                }}
                            >
                                <MDEditor
                                    value={tourForm.description}
                                    onChange={(val) =>
                                        setTourForm({
                                            ...tourForm,
                                            description: val || "",
                                        })
                                    }
                                    preview="live"
                                    // height={300}
                                    textareaProps={{
                                        placeholder: "Write Markdown here…",
                                        style: {
                                            color: theme.palette.text.primary,
                                        },
                                    }}
                                    previewOptions={{
                                        style: {
                                            backgroundColor:
                                                theme.palette.background
                                                    .default,
                                            color: theme.palette.text.primary,
                                        },
                                    }}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="Destination"
                                value={tourForm.destination}
                                onChange={(e) =>
                                    setTourForm({
                                        ...tourForm,
                                        destination: e.target.value,
                                    })
                                }
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Regular Price"
                                value={tourForm.regularPrice}
                                onChange={(e) =>
                                    setTourForm({
                                        ...tourForm,
                                        regularPrice: e.target.value,
                                    })
                                }
                                margin="normal"
                                type="number"
                            />
                            <TextField
                                fullWidth
                                label="Premium Price"
                                value={tourForm.premiumPrice}
                                onChange={(e) =>
                                    setTourForm({
                                        ...tourForm,
                                        premiumPrice: e.target.value,
                                    })
                                }
                                margin="normal"
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Tour Images
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                Image operations (upload, delete, set primary)
                                are applied immediately.
                            </Typography>
                            <TourImageUpload
                                tourId={editingTour?.tourId}
                                onImagesUpdate={(images) => {
                                    const primaryImage = images.find(
                                        (img) => img.isPrimary
                                    );
                                    setTourForm({
                                        ...tourForm,
                                        primaryImageUrl:
                                            primaryImage?.url || "",
                                        images: images.map((img) => img.url),
                                    });
                                    // Refresh tours data to update the display
                                    fetchToursData();
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditTourOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateTour} variant="contained">
                        Update Tour Information
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
