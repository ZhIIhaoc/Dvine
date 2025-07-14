import React, { useState } from "react";
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
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [selectedCatalogue, setSelectedCatalogue] = useState("");
    const [location, setLocation] = useState("");
    const [duration, setDuration] = useState("");

    const handleSearch = () => {
        const filters = {
            searchTerm,
            priceRange,
            catalogueId: selectedCatalogue,
            location,
            duration,
        };
        onSearch(filters);
    };

    const handleClear = () => {
        setSearchTerm("");
        setPriceRange([0, 2000]);
        setSelectedCatalogue("");
        setLocation("");
        setDuration("");
        onClear();
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Search & Filter Tours
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        label="Search tours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                        }}
                    />
                </Grid>
                
                <Grid item xs={12} md={2}>
                    <FormControl fullWidth sx={{ minWidth: 160 }}>
                        <InputLabel>Catalogue</InputLabel>
                        <Select
                            value={selectedCatalogue}
                            onChange={(e) => setSelectedCatalogue(e.target.value)}
                            label="Catalogue"
                        >
                            <MenuItem value="">All Catalogues</MenuItem>
                            <MenuItem value="1">Adventure Collection</MenuItem>
                            <MenuItem value="2">Luxury Collection</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} md={2}>
                    <FormControl fullWidth sx={{ minWidth: 160 }}>
                        <InputLabel>Location</InputLabel>
                        <Select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            label="Location"
                        >
                            <MenuItem value="">All Locations</MenuItem>
                            <MenuItem value="Coffs Harbour">Coffs Harbour</MenuItem>
                            <MenuItem value="Port Macquarie">Port Macquarie</MenuItem>
                            <MenuItem value="Sydney">Sydney</MenuItem>
                            <MenuItem value="Melbourne">Melbourne</MenuItem>
                            <MenuItem value="Brisbane">Brisbane</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} md={2}>
                    <FormControl fullWidth sx={{ minWidth: 160 }}>
                        <InputLabel>Duration</InputLabel>
                        <Select
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
                
                <Grid item xs={12} md={3}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<FilterIcon />}
                            onClick={handleSearch}
                            sx={{ flexGrow: 1 }}
                        >
                            SEARCH
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClear}
                        >
                            CLEAR
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Typography>
                <Slider
                    value={priceRange}
                    onChange={(event, newValue) => setPriceRange(newValue)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={2000}
                    step={50}
                />
            </Box>
            
            {/* Active Filters */}
            {(searchTerm || selectedCatalogue || location || duration || (priceRange[0] > 0 || priceRange[1] < 2000)) && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Active Filters:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {searchTerm && (
                            <Chip
                                label={`Search: ${searchTerm}`}
                                onDelete={() => setSearchTerm("")}
                                size="small"
                            />
                        )}
                        {selectedCatalogue && (
                            <Chip
                                label={`Catalogue: ${selectedCatalogue}`}
                                onDelete={() => setSelectedCatalogue("")}
                                size="small"
                            />
                        )}
                        {location && (
                            <Chip
                                label={`Location: ${location}`}
                                onDelete={() => setLocation("")}
                                size="small"
                            />
                        )}
                        {duration && (
                            <Chip
                                label={`Duration: ${duration} days`}
                                onDelete={() => setDuration("")}
                                size="small"
                            />
                        )}
                        {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                            <Chip
                                label={`Price: $${priceRange[0]} - $${priceRange[1]}`}
                                onDelete={() => setPriceRange([0, 2000])}
                                size="small"
                            />
                        )}
                    </Box>
                </Box>
            )}
        </Paper>
    );
} 