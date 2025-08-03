import React, { useState, useEffect } from 'react';
import {
    Box,
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    ListItemIcon,
    ListItemText,
    Divider,
    Button,
    CircularProgress,
    Paper,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Favorite as FavoriteIcon,
    Comment as CommentIcon,
    Person as PersonIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';

const MomentNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mock notification data
    const mockNotifications = [
        {
            id: 1,
            type: 'like',
            message: 'User John liked your moment',
            momentId: 123,
            userId: 456,
            userName: 'John',
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            read: false,
        },
        {
            id: 2,
            type: 'comment',
            message: 'User Sarah commented on your moment',
            momentId: 123,
            userId: 789,
            userName: 'Sarah',
            comment: 'So beautiful! I want to go there too!',
            timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            read: false,
        },
        {
            id: 3,
            type: 'like',
            message: 'User Mike liked your moment',
            momentId: 124,
            userId: 101,
            userName: 'Mike',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            read: true,
        },
    ];

    useEffect(() => {
        // Simulate loading notifications
        setLoading(true);
        setTimeout(() => {
            setNotifications(mockNotifications);
            setUnreadCount(mockNotifications.filter(n => !n.read).length);
            setLoading(false);
        }, 1000);
    }, []);

    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationItemClick = (notification) => {
        // Mark as read
        setNotifications(prev => 
            prev.map(n => 
                n.id === notification.id ? { ...n, read: true } : n
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Navigate to relevant moment
        // Add navigation logic here
        console.log('Navigate to moment:', notification.momentId);
        
        handleClose();
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const handleClearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
        handleClose();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return <FavoriteIcon color="error" />;
            case 'comment':
                return <CommentIcon color="primary" />;
            case 'follow':
                return <PersonIcon color="success" />;
            default:
                return <NotificationsIcon />;
        }
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 7) return `${days} days ago`;
        return timestamp.toLocaleDateString();
    };

    const open = Boolean(anchorEl);

    return (
        <Box>
            <IconButton
                onClick={handleNotificationClick}
                sx={{ color: 'inherit' }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 350,
                        maxHeight: 500,
                    },
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Notifications</Typography>
                        <Box>
                            {unreadCount > 0 && (
                                <Button
                                    size="small"
                                    onClick={handleMarkAllAsRead}
                                    sx={{ mr: 1 }}
                                >
                                    Mark All as Read
                                </Button>
                            )}
                            <IconButton size="small" onClick={handleClearAll}>
                                <ClearIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : notifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No notifications
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationItemClick(notification)}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                                    '&:hover': {
                                        backgroundColor: 'action.selected',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    {getNotificationIcon(notification.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: notification.read ? 'normal' : 'bold',
                                            }}
                                        >
                                            {notification.message}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTimestamp(notification.timestamp)}
                                        </Typography>
                                    }
                                />
                                {!notification.read && (
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: 'primary.main',
                                        }}
                                    />
                                )}
                            </MenuItem>
                        ))
                    )}
                </Box>

                {notifications.length > 0 && (
                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            onClick={handleClose}
                        >
                            View All Notifications
                        </Button>
                    </Box>
                )}
            </Menu>
        </Box>
    );
};

export default MomentNotification; 