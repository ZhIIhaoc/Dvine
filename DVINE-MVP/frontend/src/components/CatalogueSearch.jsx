import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Typography,
    Button,
    Chip,
    Paper,
    Grid,
} from "@mui/material";
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
} from "@mui/icons-material";

export default function CatalogueSearch({ onSearch, onClear }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [selectedCatalogue, setSelectedCatalogue] = useState("");
    const [location, setLocation] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        const filters = {
            searchTerm,
            priceRange,
            catalogueId: selectedCatalogue,
            location,
            duration,
        };
        onSearch(filters);
    }, [searchTerm, priceRange, selectedCatalogue, location, duration]);

    return (
        <Paper
            sx={{
                py: 3,
                px: 5,
                mb: 3,
                width: "100%",
                backgroundColor: "background.primary",
            }}
        >
            <Typography variant="h6" fontWeight="regular" gutterBottom>
                Search & Filter Experiences
            </Typography>

            <Grid
                container
                spacing={3}
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "repeat(1, 1fr)",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(5, 1fr)",
                    },
                }}
            >
                <Grid item>
                    <TextField
                        fullWidth
                        label="Search tours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputLabelProps={{
                            sx: (theme) => ({
                                color: "text.primary",
                            }),
                        }}
                    />
                </Grid>

                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel
                            id="catalogue-label"
                            sx={{
                                color: "text.primary",
                            }}
                        >
                            Catalogue Type
                        </InputLabel>
                        <Select
                            labelId="catalogue-label"
                            value={selectedCatalogue}
                            onChange={(e) =>
                                setSelectedCatalogue(e.target.value)
                            }
                            label="Catalogue Type"
                        >
                            <MenuItem value="">All Catalogues</MenuItem>
                            <MenuItem value="1">Adventure Collection</MenuItem>
                            <MenuItem value="2">Luxury Collection</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel
                            id="location-label"
                            sx={{
                                color: "text.primary",
                            }}
                        >
                            Location
                        </InputLabel>
                        <Select
                            labelId="location-label"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            label="Location"
                        >
                            <MenuItem value="">All Locations</MenuItem>
                            <MenuItem value="Coffs Harbour">
                                Coffs Harbour
                            </MenuItem>
                            <MenuItem value="Port Macquarie">
                                Port Macquarie
                            </MenuItem>
                            <MenuItem value="Sydney">Sydney</MenuItem>
                            <MenuItem value="Melbourne">Melbourne</MenuItem>
                            <MenuItem value="Brisbane">Brisbane</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel
                            id="duration-label"
                            sx={{
                                color: "text.primary",
                            }}
                        >
                            Duration
                        </InputLabel>
                        <Select
                            labelId="duration-label"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            label="Duration"
                        >
                            <MenuItem value="">Any Duration</MenuItem>
                            <MenuItem value="1">1 Day</MenuItem>
                            <MenuItem value="2">2 Days</MenuItem>
                            <MenuItem value="3">3+ Days</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                minWidth: 100,
                            }}
                        >
                            <Typography>Price</Typography>
                            <Typography
                                variant="body2"
                                color="text.primary"
                                gutterBottom
                            >
                                (${priceRange[0]} - ${priceRange[1]})
                            </Typography>
                        </Box>

                        <Slider
                            value={priceRange}
                            onChange={(event, newValue) =>
                                setPriceRange(newValue)
                            }
                            valueLabelDisplay="auto"
                            min={0}
                            max={5000}
                            step={50}
                            sx={{ flexGrow: 1 }}
                        />
                    </Box>
                </Grid>
            </Grid>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    mt: 2,
                }}
            >
                <Typography
                    variant="body2"
                    color="text.primary"
                    gutterBottom
                    sx={{ mr: 1 }}
                >
                    Active Filters:
                </Typography>
                {/* Active Filters */}
                {(searchTerm ||
                    selectedCatalogue ||
                    location ||
                    duration ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 5000) && (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {searchTerm && (
                            <Chip
                                label={`Search: ${searchTerm}`}
                                onDelete={() => setSearchTerm("")}
                                size="small"
                                sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "primary.dark",
                                        cursor: "pointer",
                                    },
                                    "& .MuiChip-deleteIcon": {
                                        color: "white",
                                        "&:hover": {
                                            color: "white",
                                        },
                                    },
                                }}
                            />
                        )}
                        {selectedCatalogue && (
                            <Chip
                                label={`Catalogue: ${selectedCatalogue}`}
                                onDelete={() => setSelectedCatalogue("")}
                                size="small"
                                sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "primary.dark",
                                        cursor: "pointer",
                                    },
                                    "& .MuiChip-deleteIcon": {
                                        color: "white",
                                        "&:hover": {
                                            color: "white",
                                        },
                                    },
                                }}
                            />
                        )}
                        {location && (
                            <Chip
                                label={`Location: ${location}`}
                                onDelete={() => setLocation("")}
                                size="small"
                                sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "primary.dark",
                                        cursor: "pointer",
                                    },
                                    "& .MuiChip-deleteIcon": {
                                        color: "white",
                                        "&:hover": {
                                            color: "white",
                                        },
                                    },
                                }}
                            />
                        )}
                        {duration && (
                            <Chip
                                label={`Duration: ${duration} days`}
                                onDelete={() => setDuration("")}
                                size="small"
                                sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "primary.dark",
                                        cursor: "pointer",
                                    },
                                    "& .MuiChip-deleteIcon": {
                                        color: "white",
                                        "&:hover": {
                                            color: "white",
                                        },
                                    },
                                }}
                            />
                        )}
                        {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                            <Chip
                                label={`Price: $${priceRange[0]} - $${priceRange[1]}`}
                                onDelete={() => setPriceRange([0, 5000])}
                                size="small"
                                sx={{
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    "&:hover": {
                                        backgroundColor: "primary.dark",
                                        cursor: "pointer",
                                    },
                                    "& .MuiChip-deleteIcon": {
                                        color: "white",
                                        "&:hover": {
                                            color: "white",
                                        },
                                    },
                                }}
                            />
                        )}
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
