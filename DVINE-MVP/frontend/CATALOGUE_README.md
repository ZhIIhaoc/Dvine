# DVINE Catalogue Frontend Implementation

## Overview

This document describes the comprehensive catalogue frontend implementation for the DVINE travel platform. The catalogue system provides a complete tour management interface with search, filtering, and booking capabilities.

## Features Implemented

### 🎯 Core Features

1. **Catalogue Management**

   - View all catalogues with their details
   - Create new catalogues (Admin/Partner users)
   - Edit existing catalogues (Catalogue owners)
   - Delete catalogues with cascade tour deletion
   - Catalogue type classification (Official vs Partner)
2. **Tour Display**

   - Grid layout showing all available tours
   - Individual tour cards with images, prices, and ratings
   - Hover effects and smooth transitions
   - Click navigation to detailed tour pages
3. **Tour Details Page**

   - Comprehensive tour information display
   - Image gallery with Swiper carousel
   - Tabbed sections for highlights, itinerary, inclusions, and reviews
   - Booking functionality with form validation
   - Responsive design for all screen sizes
4. **Search & Filtering**

   - Text search across tour titles, destinations, and descriptions
   - Price range filtering with slider
   - Catalogue-based filtering
   - Difficulty and duration filters
   - Active filter chips with individual removal
5. **User Management**

   - Permission-based access control
   - Admin/Partner catalogue management
   - User authentication integration
   - Role-based UI elements

## 🏗️ Architecture

### Components Structure

```
src/
├── pages/
│   ├── Catalogue.jsx          # Main catalogue page
│   └── TourDetails.jsx        # Individual tour details
├── components/
│   ├── CatalogueSearch.jsx    # Search and filter component
│   └── CreateTourModal.jsx    # Tour creation modal
├── endpoints/
│   ├── CatalogueEndpoints.js  # API endpoint functions
│   └── CreateTours.js         # Tour creation endpoint
└── assets/                    # Tour images and media
```

### Data Flow

1. **Catalogue Page Load**

   ```
   Component Mount → Fetch Catalogues → Fetch Tours → Render UI
   ```
2. **Search & Filter**

   ```
   User Input → Filter Logic → Update State → Re-render Tours
   ```
3. **Tour Details**

   ```
   Route Change → Fetch Tour Data → Render Details → Booking Flow
   ```

## 🎨 UI/UX Features

### Design System

- **Material-UI Components**: Consistent design language
- **Responsive Grid**: Adapts to mobile, tablet, and desktop
- **Color Scheme**: Purple primary theme with proper contrast
- **Typography**: Clear hierarchy with proper spacing

### Interactive Elements

- **Hover Effects**: Cards lift and shadow changes
- **Loading States**: Spinner during data fetching
- **Error Handling**: Alert messages for failed operations
- **Success Feedback**: Confirmation dialogs and messages

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and roles
- **Color Contrast**: WCAG compliant color combinations
- **Focus Management**: Logical tab order

## 🔧 Technical Implementation

### State Management

```javascript
// Catalogue page state
const [catalogues, setCatalogues] = useState([]);
const [tours, setTours] = useState([]);
const [filteredTours, setFilteredTours] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
```

### API Integration

```javascript
// Endpoint functions
export const fetchCatalogues = async (token = null) => { ... };
export const createCatalogue = async (catalogueData, token) => { ... };
export const fetchAllTours = async (token = null) => { ... };
export const fetchTourById = async (tourId, token = null) => { ... };
```

### Search & Filter Logic

```javascript
const handleSearch = (filters) => {
    let filtered = [...tours];
  
    // Text search
    if (filters.searchTerm) {
        filtered = filtered.filter(tour =>
            tour.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
    }
  
    // Price range
    filtered = filtered.filter(tour => 
        tour.price >= filters.priceRange[0] && tour.price <= filters.priceRange[1]
    );
  
    setFilteredTours(filtered);
};
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- React 18+
- Material-UI 5+
- Backend API running on localhost:8080

### Installation

```bash
cd frontend
npm install
npm run dev
```

### Environment Setup

```bash
# Backend should be running on
http://localhost:8080

# Frontend will run on
http://localhost:5173
```

## 📱 Usage Guide

### For Regular Users

1. **Browse Tours**: Visit `/catalogue` to see all available tours
2. **Search & Filter**: Use the search bar and filters to find specific tours
3. **View Details**: Click on any tour card to see detailed information
4. **Book Tours**: Use the booking form on tour details page

### For Admin/Partner Users

1. **Manage Catalogues**: Create, edit, and delete catalogues
2. **Create Tours**: Use the tour creation modal
3. **Monitor Content**: View catalogue statistics and tour counts

## 🔒 Security Features

### Authentication

- JWT token-based authentication
- Role-based access control
- Secure API communication

### Authorization

```javascript
// Permission levels
const PermissionLevel = {
    REGULAR: 0,
    PREMIUM: 1,
    PARTNER: 2,  // Can create catalogues
    MANAGER: 3,
    OWNER: 4
};
```

### Data Validation

- Form validation on client side
- API response validation
- Error handling for failed requests

## 🧪 Testing

### Manual Testing Checklist

- [ ]  Catalogue page loads correctly
- [ ]  Search and filter functionality works
- [ ]  Tour details page displays properly
- [ ]  Booking form validation
- [ ]  Admin features (create/edit/delete catalogues)
- [ ]  Responsive design on different screen sizes
- [ ]  Error handling for network issues

### API Testing

```bash
# Test catalogue endpoints
curl http://localhost:8080/catalogues/list
curl http://localhost:8080/tours
```

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Image Upload**: Currently uses URL input, no file upload
2. **Real-time Updates**: No WebSocket integration for live updates
3. **Offline Support**: No offline caching implemented
4. **Advanced Search**: Limited to basic text and filter search

### Planned Improvements

1. **Image Upload**: Implement file upload with preview
2. **Real-time Features**: Add live booking status updates
3. **Advanced Search**: Implement full-text search with Elasticsearch
4. **Performance**: Add virtual scrolling for large tour lists
5. **Analytics**: Add user behavior tracking

## 📊 Performance Considerations

### Optimization Strategies

- **Lazy Loading**: Images load on demand
- **Pagination**: Large datasets are paginated
- **Caching**: API responses cached in memory
- **Bundle Splitting**: Code split by routes

### Monitoring

- **Loading States**: Visual feedback during operations
- **Error Boundaries**: Graceful error handling
- **Performance Metrics**: Track render times and API calls

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Submit pull request
5. Code review and merge

### Code Standards

- **ESLint**: Enforce code quality
- **Prettier**: Consistent formatting
- **TypeScript**: Type safety (future implementation)
- **Component Testing**: Unit tests for components

## 📚 Additional Resources

### Documentation

- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Swiper Documentation](https://swiperjs.com/)

### Related Files

- `backend/DVINE-API/src/main/java/com/dvineapi/controller/CatalogueController.java`
- `backend/DVINE-SERVICE/src/main/java/com/dvineservice/service/CatalogueService.java`
- `db/01_schema.sql` - Database schema

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintainer**: DVINE Development Team (T18A-BANANA)
