import React, { useState } from "react";
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    Paper,
    Typography,
    IconButton,
    Collapse,
    Grid,
    useTheme,
} from "@mui/material";
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    TrendingUp as TrendingUpIcon,
    AccessTime as AccessTimeIcon,
    Favorite as FavoriteIcon,
} from "@mui/icons-material";

const MomentSearchFilter = ({ onSearch, onFilter, onClear }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);
    const theme = useTheme();
    const sortOptions = [
        { value: "latest", label: "Latest", icon: <AccessTimeIcon /> },
        { value: "popular", label: "Most Popular", icon: <TrendingUpIcon /> },
        { value: "mostLiked", label: "Most Liked", icon: <FavoriteIcon /> },
    ];

    const handleSearch = () => {
        const filters = {
            searchTerm,
            sortBy,
        };

        // Update active filters
        const newActiveFilters = [];
        if (searchTerm) newActiveFilters.push(`Search: "${searchTerm}"`);
        if (sortBy !== "latest") {
            const sortLabel = sortOptions.find(
                (opt) => opt.value === sortBy
            )?.label;
            newActiveFilters.push(`Sort: ${sortLabel}`);
        }
        setActiveFilters(newActiveFilters);

        onSearch(filters);
    };

    const handleClear = () => {
        setSearchTerm("");
        setSortBy("latest");
        setActiveFilters([]);
        onClear();
    };

    const removeFilter = (filterIndex) => {
        const filter = activeFilters[filterIndex];
        if (filter.startsWith("Search:")) {
            setSearchTerm("");
        } else if (filter.startsWith("Sort:")) {
            setSortBy("latest");
        }

        const newActiveFilters = activeFilters.filter(
            (_, index) => index !== filterIndex
        );
        setActiveFilters(newActiveFilters);

        // Re-apply filters
        const filters = {
            searchTerm: filter.startsWith("Search:") ? "" : searchTerm,
            sortBy: filter.startsWith("Sort:") ? "latest" : sortBy,
        };
        onSearch(filters);
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "background.paper" }}>
            {/* Search Bar */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search moment content, title, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                        startAdornment: (
                            <SearchIcon sx={{ mr: 1, color: "text.primary" }} />
                        ),
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "divider",
                            },
                            "&:hover fieldset": {
                                borderColor: "primary.main",
                            },
                        },
                    }}
                />

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel
                        id="sort-by-label"
                        sx={{ color: "text.primary" }}
                    >
                        Sort By
                    </InputLabel>
                    <Select
                        value={sortBy}
                        label="Sort By"
                        labelId="sort-by-label"
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    borderColor: "divider",
                                },
                                "&:hover fieldset": {
                                    borderColor: "primary.main",
                                },
                            },
                        }}
                    >
                        {sortOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    {option.icon}
                                    {option.label}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    Filter
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                    disabled={!searchTerm && sortBy === "latest"}
                >
                    Clear
                </Button>
            </Box>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                    >
                        Current Filters:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {activeFilters.map((filter, index) => (
                            <Chip
                                key={index}
                                label={filter}
                                onDelete={() => removeFilter(index)}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* Advanced Filters */}
            <Collapse in={showFilters}>
                <Box
                    sx={{
                        pt: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Advanced Filters
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Location"
                                placeholder="Enter location keyword"
                                size="small"
                                InputLabelProps={{
                                    sx: {
                                        color: theme.palette.text.primary,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Time Range</InputLabel>
                                <Select label="Time Range" defaultValue="">
                                    <MenuItem value="">All Time</MenuItem>
                                    <MenuItem value="today">Today</MenuItem>
                                    <MenuItem value="week">This Week</MenuItem>
                                    <MenuItem value="month">
                                        This Month
                                    </MenuItem>
                                    <MenuItem value="year">This Year</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Likes Count</InputLabel>
                                <Select label="Likes Count" defaultValue="">
                                    <MenuItem value="">Any</MenuItem>
                                    <MenuItem value="10+">10+ Likes</MenuItem>
                                    <MenuItem value="50+">50+ Likes</MenuItem>
                                    <MenuItem value="100+">100+ Likes</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Comments Count</InputLabel>
                                <Select label="Comments Count" defaultValue="">
                                    <MenuItem value="">Any</MenuItem>
                                    <MenuItem value="5+">5+ Comments</MenuItem>
                                    <MenuItem value="10+">
                                        10+ Comments
                                    </MenuItem>
                                    <MenuItem value="20+">
                                        20+ Comments
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default MomentSearchFilter;
