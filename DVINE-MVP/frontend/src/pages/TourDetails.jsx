import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTourById, updateTour } from "../endpoints/CatalogueEndpoints";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    Chip,
    Rating,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Fab,
    Tooltip,
    Avatar,
    Badge,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme,
} from "@mui/material";
import {
    LocationOn as LocationIcon,
    // AttachMoney as PriceIcon,
    Star as StarIcon,
    Person as PersonIcon,
    Category as CategoryIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Group as GroupIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Share as ShareIcon,
    BookOnline as BookIcon,
    ArrowBack as BackIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    ExpandMore as ExpandMoreIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as WebsiteIcon,
    Edit as EditIcon,
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import MDEditor from "@uiw/react-md-editor";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PriceDisplay from "../components/PriceDisplay";
import { useAuth } from "../components/AuthContext";
import BookNowButton from "../components/BookNowButton";
import TourImageUpload from "../components/TourImageUpload";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// Mock data for fallback
const mockTour = {
    tourId: 1,
    title: "Coffs Harbour Adventure",
    destination: "Coffs Harbour, NSW",
    description:
        "Experience the stunning coastline and vibrant marine life of Coffs Harbour. This comprehensive tour takes you through the most beautiful and exciting locations in the region, including pristine beaches, lush rainforests, and charming coastal towns.",
    price: 299.99,
    primaryImageUrl: "/src/assets/coffs_harbour.png",
    images: [
        "/src/assets/coffs_harbour.png",
        "/src/assets/port_macquarie.jpg",
        "/src/assets/vip_experience.jpg",
        "/src/assets/sunset.jpg",
    ],
    catalogueId: 1,
    catalogueTitle: "Adventure Collection",
    creatorNickName: "DVINE Team",
    duration: "2 days, 1 night",
    groupSize: "2-8 people",
    difficulty: "Moderate",
    highlights: [
        "Visit the famous Big Banana",
        "Explore the Coffs Harbour Marina",
        "Hike through the Dorrigo National Park",
        "Swim with dolphins",
        "Enjoy local seafood cuisine",
    ],
    itinerary: [
        {
            day: 1,
            title: "Arrival & Welcome",
            activities: [
                "Airport pickup and transfer to hotel",
                "Welcome dinner at local restaurant",
                "Briefing about the tour schedule",
            ],
        },
        {
            day: 2,
            title: "Coastal Adventure",
            activities: [
                "Morning beach walk",
                "Marina tour and boat trip",
                "Afternoon rainforest hike",
                "Sunset dinner at beachfront restaurant",
            ],
        },
    ],
    included: [
        "Accommodation in 4-star hotel",
        "All meals and snacks",
        "Professional tour guide",
        "Transportation throughout the tour",
        "Entrance fees to attractions",
        "Travel insurance",
    ],
    notIncluded: [
        "International flights",
        "Personal expenses",
        "Optional activities",
        "Tips for guides",
    ],
    reviews: [
        {
            id: 1,
            user: "Sarah M.",
            rating: 5,
            comment:
                "Amazing experience! The tour guide was knowledgeable and the locations were breathtaking.",
            date: "2024-01-15",
        },
        {
            id: 2,
            user: "John D.",
            rating: 4,
            comment:
                "Great tour with beautiful scenery. Would recommend to anyone visiting the area.",
            date: "2024-01-10",
        },
        {
            id: 3,
            user: "Emma L.",
            rating: 5,
            comment:
                "Perfect blend of adventure and relaxation. The accommodation was excellent.",
            date: "2024-01-05",
        },
    ],
};

export default function TourDetails() {
    const theme = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookingOpen, setBookingOpen] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        participants: 1,
        startDate: "",
        specialRequests: "",
    });
    const [activeTab, setActiveTab] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const token = localStorage.getItem("accessToken");
    const { userInfo } = useAuth();
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        destination: "",
        catalogueId: 1, // Add catalogueId with default value
        regularPrice: "",
        premiumPrice: "",
        primaryImageUrl: "",
        images: [],
    });
    // Remove state and DatePicker related to travelDate

    // Fetch tour details
    const fetchTourDetails = async () => {
        try {
            const result = await fetchTourById(id);
            if (result.code === 0) {
                setTour(result.data);
            } else {
                // Fallback to mock data
                setTour(mockTour);
            }
        } catch (error) {
            console.error("Error fetching tour details:", error);
            setTour(mockTour);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTourDetails();
        window.scrollTo(0, 0);
    }, [id]);

    // Handle booking submission
    const handleBooking = async () => {
        try {
            // Here you would typically send the booking to your backend
            console.log("Booking submitted:", {
                tourId: id,
                ...bookingForm,
            });

            // For now, just show success and close dialog
            setBookingOpen(false);
            setBookingForm({
                participants: 1,
                startDate: "",
                specialRequests: "",
            });
            alert("Booking request submitted successfully!");
        } catch (error) {
            console.error("Error submitting booking:", error);
            setError("Failed to submit booking");
        }
    };

    // Calculate average rating
    const averageRating =
        tour?.reviews?.length > 0
            ? tour.reviews.reduce((sum, review) => sum + review.rating, 0) /
              tour.reviews.length
            : 4.5;

    // Open edit modal
    const handleEditOpen = () => {
        setEditForm({
            title: tour?.title || "",
            description: tour?.description || "",
            destination: tour?.destination || "",
            catalogueId: tour?.catalogueId || 1, // Add catalogueId with default value
            regularPrice: tour?.regularPrice ?? tour?.price ?? "",
            premiumPrice: tour?.premiumPrice ?? tour?.price ?? "",
            primaryImageUrl: tour?.primaryImageUrl || "",
            images: tour?.images || [],
        });
        setEditOpen(true);
    };
    const handleEditSubmit = async () => {
        try {
            const result = await updateTour({
                ...editForm,
                tourId: tour.tourId,
            });
            if (result.code === 0) {
                setEditOpen(false);
                fetchTourDetails();
            } else {
                alert("Failed to update tour");
            }
        } catch {
            alert("Error updating tour");
        }
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

    if (!tour) {
        return (
            <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h4" color="error">
                    Tour not found
                </Typography>
                <Button onClick={() => navigate("/catalogue")} sx={{ mt: 2 }}>
                    Back to Catalogue
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", py: 4, px: { xs: 2, sm: 4, md: 8 } }}>
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

            {/* Back Button */}
            <Button
                startIcon={<BackIcon />}
                onClick={() => navigate("/catalogue")}
                sx={{
                    mt: -4,
                    mb: 3,
                    color: "gray",
                    fontWeight: "regular",
                    ml: { sm: 1, md: 6 },
                }}
            >
                Back to Catalogue
            </Button>

            {/* Image Gallery */}
            <Box sx={{ mb: 4 }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={true}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000 }}
                    loop={true}
                    style={{ width: "80%", height: "500px" }}
                >
                    {tour.images?.map((image, index) => (
                        <SwiperSlide key={index}>
                            <CardMedia
                                component="img"
                                image={image}
                                alt={`${tour.title} - Image ${index + 1}`}
                                sx={{
                                    width: "100%",
                                    height: "500px",
                                    objectFit: "cover",
                                }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", px: 2 }}>
                <Grid
                    container
                    spacing={4}
                    sx={{
                        width: "100%",
                        flexWrap: { xs: "wrap", md: "nowrap" },
                    }}
                >
                    {/* Main Content */}
                    <Grid
                        item
                        xs={12}
                        md
                        sx={{
                            flexBasis: 0,
                            flexGrow: 1,
                            flexShrink: 1,
                        }}
                    >
                        {/* Tour Header */}
                        <Box sx={{ mb: 3 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 2,
                                    mx: "auto",
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    gutterBottom
                                >
                                    {tour.title}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Tooltip
                                        title={
                                            isFavorite
                                                ? "Remove from favorites"
                                                : "Add to favorites"
                                        }
                                    >
                                        <IconButton
                                            onClick={() =>
                                                setIsFavorite(!isFavorite)
                                            }
                                            color={
                                                isFavorite ? "error" : "default"
                                            }
                                        >
                                            {isFavorite ? (
                                                <FavoriteIcon />
                                            ) : (
                                                <FavoriteBorderIcon />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Share tour">
                                        <IconButton>
                                            <ShareIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {userInfo?.permission >= 2 && (
                                        <Tooltip title="Edit Tour">
                                            <IconButton
                                                onClick={handleEditOpen}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 2,
                                }}
                            >
                                <LocationIcon
                                    sx={{ mr: 1, color: "text.primary" }}
                                />
                                <Typography variant="h6" color="text.primary">
                                    {tour.destination}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mb: 2,
                                }}
                            >
                                <PriceDisplay
                                    regularPrice={
                                        tour?.regularPrice ?? tour?.price
                                    }
                                    premiumPrice={
                                        tour?.premiumPrice ?? tour?.price
                                    }
                                    userPermission={userInfo?.permission ?? 0}
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 2,
                                }}
                            >
                                <Rating
                                    value={averageRating}
                                    readOnly
                                    precision={0.5}
                                />
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                    {averageRating.toFixed(1)} (
                                    {tour.reviews?.length || 0} reviews)
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    flexWrap: "wrap",
                                }}
                            >
                                <Chip
                                    icon={<TimeIcon />}
                                    label={tour.duration}
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<GroupIcon />}
                                    label={tour.groupSize}
                                    variant="outlined"
                                />
                                <Chip
                                    label={tour.difficulty}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>

                        {/* Description */}
                        <Paper
                            sx={{
                                p: 3,
                                mb: 3,
                                width: "100%",
                                wordBreak: "break-word",
                            }}
                        >
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom
                            >
                                About This Tour
                            </Typography>
                            <Box
                                sx={{
                                    "& img": { maxWidth: "100%" },
                                    "& pre": {
                                        p: 2,
                                        backgroundColor: "grey.100",
                                        borderRadius: 1,
                                    },
                                }}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    sx={{ wordBreak: "break-word" }}
                                >
                                    {tour.description}
                                </ReactMarkdown>
                            </Box>
                        </Paper>

                        {/* Tabs for Details */}
                        <Paper sx={{ mb: 3 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, newValue) =>
                                    setActiveTab(newValue)
                                }
                                textColor="inherit"
                                indicatorColor="primary"
                            >
                                <Tab label="Highlights" />
                                <Tab label="Itinerary" />
                                <Tab label="What's Included" />
                                <Tab label="Reviews" />
                            </Tabs>

                            <Box sx={{ p: 3, minHeight: 150 }}>
                                {activeTab === 0 && (
                                    <List>
                                        {tour.highlights?.map(
                                            (highlight, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <StarIcon color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={highlight}
                                                    />
                                                </ListItem>
                                            )
                                        )}
                                    </List>
                                )}

                                {activeTab === 1 && (
                                    <Box>
                                        {tour.itinerary?.map((day) => (
                                            <Accordion
                                                key={day.day}
                                                sx={{ mb: 1 }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={
                                                        <ExpandMoreIcon />
                                                    }
                                                >
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: "text.primary",
                                                        }}
                                                    >
                                                        Day {day.day}:{" "}
                                                        {day.title}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <List dense>
                                                        {day.activities.map(
                                                            (
                                                                activity,
                                                                index
                                                            ) => (
                                                                <ListItem
                                                                    key={index}
                                                                >
                                                                    <ListItemIcon>
                                                                        <CalendarIcon color="primary" />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={
                                                                            activity
                                                                        }
                                                                    />
                                                                </ListItem>
                                                            )
                                                        )}
                                                    </List>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Box>
                                )}

                                {activeTab === 2 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography
                                                variant="h6"
                                                color="success.main"
                                                gutterBottom
                                            >
                                                What&apos;s Included
                                            </Typography>
                                            <List dense>
                                                {tour.included?.map(
                                                    (item, index) => (
                                                        <ListItem key={index}>
                                                            <ListItemIcon>
                                                                <AddIcon color="success" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={item}
                                                            />
                                                        </ListItem>
                                                    )
                                                )}
                                            </List>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography
                                                variant="h6"
                                                color="error"
                                                gutterBottom
                                            >
                                                Not Included
                                            </Typography>
                                            <List dense>
                                                {tour.notIncluded?.map(
                                                    (item, index) => (
                                                        <ListItem key={index}>
                                                            <ListItemIcon>
                                                                <RemoveIcon color="error" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={item}
                                                            />
                                                        </ListItem>
                                                    )
                                                )}
                                            </List>
                                        </Grid>
                                    </Grid>
                                )}

                                {activeTab === 3 && (
                                    <Box>
                                        {tour.reviews?.map((review) => (
                                            <Paper
                                                key={review.id}
                                                sx={{ p: 2, mb: 2 }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        mb: 1,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight="bold"
                                                    >
                                                        {review.user}
                                                    </Typography>
                                                    <Rating
                                                        value={review.rating}
                                                        readOnly
                                                        size="small"
                                                    />
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{ mb: 1 }}
                                                >
                                                    {new Date(
                                                        review.date
                                                    ).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {review.comment}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md="auto">
                        {/* Booking Card */}
                        <Card
                            sx={{
                                position: "sticky",
                                top: 20,
                                mb: 3,
                                width: 300,
                            }}
                        >
                            <CardContent>
                                {/* <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                                ${tour.price}
                            </Typography> */}
                                {/* <Typography
                                    variant="body2"
                                    color="text.primary"
                                    gutterBottom
                                >
                                    per person
                                </Typography> */}

                                <Box sx={{ my: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() =>
                                            navigate(`/checkout/${tour.tourId}`)
                                        }
                                        fullWidth
                                    >
                                        Book Now
                                    </Button>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        variant="subtitle2"
                                        gutterBottom
                                    >
                                        Contact Information
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 1,
                                        }}
                                    >
                                        <PhoneIcon
                                            sx={{ mr: 1, fontSize: 16 }}
                                        />
                                        <Typography variant="body2">
                                            +61 2 1234 5678
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 1,
                                        }}
                                    >
                                        <EmailIcon
                                            sx={{ mr: 1, fontSize: 16 }}
                                        />
                                        <Typography variant="body2">
                                            info@dvine.com
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <WebsiteIcon
                                            sx={{ mr: 1, fontSize: 16 }}
                                        />
                                        <Typography variant="body2">
                                            www.dvine.com
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        gutterBottom
                                    >
                                        Tour Guide
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Avatar sx={{ mr: 2 }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                            >
                                                {tour.creatorNickName}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.primary"
                                            >
                                                Professional Tour Guide
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Booking Dialog */}
            <Dialog
                open={bookingOpen}
                onClose={() => setBookingOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Book Your Tour</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Number of Participants"
                        type="number"
                        value={bookingForm.participants}
                        onChange={(e) =>
                            setBookingForm({
                                ...bookingForm,
                                participants: parseInt(e.target.value) || 1,
                            })
                        }
                        margin="normal"
                        inputProps={{ min: 1, max: 10 }}
                    />
                    <TextField
                        fullWidth
                        label="Preferred Start Date"
                        type="date"
                        value={bookingForm.startDate}
                        onChange={(e) =>
                            setBookingForm({
                                ...bookingForm,
                                startDate: e.target.value,
                            })
                        }
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        fullWidth
                        label="Special Requests"
                        value={bookingForm.specialRequests}
                        onChange={(e) =>
                            setBookingForm({
                                ...bookingForm,
                                specialRequests: e.target.value,
                            })
                        }
                        margin="normal"
                        multiline
                        rows={3}
                        placeholder="Any special requirements or requests..."
                    />
                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: "grey.50",
                            borderRadius: 1,
                        }}
                    >
                        <Typography variant="subtitle2" gutterBottom>
                            Booking Summary
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                            }}
                        >
                            <Typography>Tour Price (per person):</Typography>
                            <Typography>${tour.price}</Typography>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                            }}
                        >
                            <Typography>Participants:</Typography>
                            <Typography>{bookingForm.participants}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                Total:
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary"
                            >
                                $
                                {(
                                    tour.price * bookingForm.participants
                                ).toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBookingOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleBooking} variant="contained">
                        Confirm Booking
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Edit Tour Dialog */}
            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                maxWidth="md"
                fullWidth
                disableScrollLock
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
                                Experience Information
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{ mb: 2 }}
                            >
                                Update experience details and click
                                &quot;Update&quot; to save changes.
                            </Typography>
                            <TextField
                                fullWidth
                                label="Title"
                                value={editForm.title}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        title: e.target.value,
                                    })
                                }
                                InputLabelProps={{
                                    style: {
                                        color: theme.palette.text.primary,
                                    },
                                }}
                                margin="normal"
                                required
                            />
                            {/* <TextField
                                fullWidth
                                label="Description"
                                value={editForm.description}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        description: e.target.value,
                                    })
                                }
                                margin="normal"
                                multiline
                                rows={3}
                            /> */}
                            <Typography
                                variant="body1"
                                gutterBottom
                                sx={{ mt: 1 }}
                            >
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
                                    value={editForm.description}
                                    onChange={(val) =>
                                        setEditForm({
                                            ...editForm,
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
                                value={editForm.destination}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        destination: e.target.value,
                                    })
                                }
                                margin="normal"
                                InputLabelProps={{
                                    style: {
                                        color: theme.palette.text.primary,
                                    },
                                }}
                                sx={{ mt: 4 }}
                            />
                            <TextField
                                fullWidth
                                label="Regular Price"
                                value={editForm.regularPrice}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        regularPrice: e.target.value,
                                    })
                                }
                                margin="normal"
                                type="number"
                                InputLabelProps={{
                                    style: {
                                        color: theme.palette.text.primary,
                                    },
                                }}
                                sx={{ mt: 4 }}
                            />
                            <TextField
                                fullWidth
                                label="Premium Price"
                                value={editForm.premiumPrice}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        premiumPrice: e.target.value,
                                    })
                                }
                                margin="normal"
                                type="number"
                                InputLabelProps={{
                                    style: {
                                        color: theme.palette.text.primary,
                                    },
                                }}
                                sx={{ mt: 4 }}
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
                                color="text.primary"
                                sx={{ mb: 2 }}
                            >
                                Image operations (upload, delete, set primary)
                                are applied immediately.
                            </Typography>
                            <TourImageUpload
                                tourId={tour?.tourId}
                                onImagesUpdate={(images) => {
                                    const primaryImage = images.find(
                                        (img) => img.isPrimary
                                    );
                                    setEditForm({
                                        ...editForm,
                                        primaryImageUrl:
                                            primaryImage?.url || "",
                                        images: images.map((img) => img.url),
                                    });
                                    // Refresh tour details to update the main image display
                                    fetchTourDetails();
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained">
                        Update Tour Information
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
