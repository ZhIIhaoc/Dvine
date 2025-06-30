import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    CardHeader,
    Avatar,
    Typography,
    IconButton,
    Button,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    Favorite,
    FavoriteBorder,
    Share,
    MoreVert,
    Person,
    Group,
    BookmarkBorder,
    Add,
    Search,
    Send,
} from '@mui/icons-material';

// temporary data
const mockPosts = [
    {
        id: 1,
        user: {
            name: 'User A',
            avatar: '',
            timeAgo: '3 days ago'
        },
        hashtag: '#Divine',
        image: 'src/assets/dvine_test1.png',
        likes: 24,
        isLiked: false,
        comments: [
            { id: 1, user: 'Friend 1', text: 'Amazing view!' },
            { id: 2, user: 'Friend 2', text: 'Love this place!' }
        ]
    },
    {
        id: 2,
        user: {
            name: 'User B',
            avatar: '',
            timeAgo: '5 days ago'
        },
        hashtag: '#Divine',
        image: 'src/assets/dvine_test2.png',
        likes: 18,
        isLiked: true,
        comments: [
            { id: 1, user: 'Friend 3', text: 'Beautiful sunset!' }
        ]
    }
];

export const DvineMoments = () => {
    const [posts, setPosts] = useState(mockPosts);
    const [newComment, setNewComment] = useState('');

    const handleLike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1
                };
            }
            return post;
        }));
    };

    const handleAddComment = (postId) => {
        if (newComment.trim()) {
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, {
                            id: Date.now(),
                            user: 'You',
                            text: newComment
                        }]
                    };
                }
                return post;
            }));
            setNewComment('');
        }
    };

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
            <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
                {/* Left Sidebar */}
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, borderRadius: '16px', backgroundColor: '#e9ecef' }}>
                        <List component="nav">
                            <ListItem button sx={{ borderRadius: '8px', mb: 1 }}>
                                <ListItemIcon sx={{ minWidth: '40px' }}><Person /></ListItemIcon>
                                <ListItemText primary="User" />
                            </ListItem>
                            <ListItem button sx={{ borderRadius: '8px', mb: 1 }}>
                                <ListItemIcon sx={{ minWidth: '40px' }}><Group /></ListItemIcon>
                                <ListItemText primary="Friends" />
                            </ListItem>
                            <ListItem button sx={{ borderRadius: '8px' }}>
                                <ListItemIcon sx={{ minWidth: '40px' }}><BookmarkBorder /></ListItemIcon>
                                <ListItemText primary="Favorites" />
                            </ListItem>
                        </List>
                    </Paper>
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: '50%',
                                width: '64px',
                                height: '64px',
                                backgroundColor: '#ab47bc',
                                '&:hover': { backgroundColor: '#8e24aa' }
                            }}
                        >
                            <Add sx={{ fontSize: '32px' }} />
                        </Button>
                        <Typography variant="h6" sx={{ mt: 1, color: '#6c757d' }}>DVINE Moments</Typography>
                    </Box>
                </Grid>

                {/* Main Content */}
                <Grid item xs={9}>
                    {posts.map((post) => (
                        <Card key={post.id} sx={{ display: 'flex', mb: 3, borderRadius: '16px', overflow: 'hidden' }}>
                            {/* Post Content */}
                            <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                                <CardHeader
                                    avatar={<Avatar sx={{ bgcolor: '#ab47bc' }}>{post.user.name.charAt(0)}</Avatar>}
                                    title={post.user.name}
                                    subheader={post.user.timeAgo}
                                />
                                <Typography variant="body2" color="primary" sx={{ px: 2, pb: 1, fontWeight: 'bold' }}>
                                    {post.hashtag}
                                </Typography>
                                <CardMedia
                                    component="img"
                                    image={post.image}
                                    alt="Dvine moment"
                                    sx={{ height: 350, objectFit: 'cover' }}
                                />
                                <CardActions disableSpacing sx={{ mt: 'auto' }}>
                                    <IconButton onClick={() => handleLike(post.id)} color={post.isLiked ? 'error' : 'default'}>
                                        {post.isLiked ? <Favorite /> : <FavoriteBorder />}
                                    </IconButton>
                                    <IconButton><Share /></IconButton>
                                </CardActions>
                            </Box>

                            {/* Comment Section */}
                            <Box sx={{ flex: 1, borderLeft: '1px solid #dee2e6', p: 2, display: 'flex', flexDirection: 'column', height: '500px' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Comment Section</Typography>
                                <Box sx={{ 
                                    flexGrow: 1, 
                                    overflowY: 'auto', 
                                    mb: 2, 
                                    maxHeight: '380px',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f1f1f1',
                                        borderRadius: '10px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: '#c1c1c1',
                                        borderRadius: '10px',
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                        background: '#a8a8a8',
                                    },
                                }}>
                                    {post.comments.map(comment => (
                                        <Box key={comment.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'grey.500' }}>
                                                {comment.user.charAt(0)}
                                            </Avatar>
                                            <Paper sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f1f3f5', flexGrow: 1 }}>
                                                <Typography variant="body2">{comment.text}</Typography>
                                            </Paper>
                                        </Box>
                                    ))}
                                </Box>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Add a comment..."
                                    size="small"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
                                />
                            </Box>
                        </Card>
                    ))}
                </Grid>
            </Grid>
        </Box>
    );
};