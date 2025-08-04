# Tour Images Implementation

## Overview
This document describes the implementation of tour images functionality in the DVINE application, including both backend and frontend components.

## Backend Implementation

### API Endpoints

#### 1. Upload Tour Images
- **Endpoint**: `POST /tours/{tourId}/images`
- **Authentication**: Required (PARTNER level)
- **Authorization**: Tour owner only
- **Parameters**:
  - `files`: MultipartFile[] (required)
  - `isPrimary`: boolean (optional, default: false)
- **Response**: List of uploaded image URLs

#### 2. Get Tour Images
- **Endpoint**: `GET /tours/{tourId}/images`
- **Authentication**: Not required (public)
- **Response**: List of tour images with metadata

#### 3. Delete Tour Image
- **Endpoint**: `DELETE /tours/{tourId}/images/{imageId}`
- **Authentication**: Required (PARTNER level)
- **Authorization**: Tour owner only
- **Response**: Success confirmation

#### 4. Update Tour Image
- **Endpoint**: `PUT /tours/{tourId}/images/{imageId}`
- **Authentication**: Required (PARTNER level)
- **Authorization**: Tour owner only
- **Parameters**:
  - `isPrimary`: boolean (optional)
- **Response**: Success confirmation

### Backend Features
- **File Validation**: JPEG, PNG, GIF, WebP formats supported
- **Size Limits**: Maximum 10MB per file
- **Count Limits**: Maximum 20 images per tour
- **S3 Storage**: Images stored in AWS S3 with organized folder structure
- **Database Storage**: Image metadata stored in database with primary image flag
- **Permission Control**: Only tour owners can upload/manage images

## Frontend Implementation

### Components

#### 1. TourImageUpload Component
**Location**: `src/components/TourImageUpload.jsx`

**Features**:
- Drag and drop file upload
- Multiple file selection
- Real-time preview
- File validation (type, size, count)
- Progress indicators
- Error handling
- Primary image management
- Image deletion

**Props**:
- `tourId`: Number (required)
- `onImagesUpdate`: Function (optional)
- `maxFiles`: Number (default: 20)
- `maxFileSize`: Number (default: 10MB)
- `acceptedTypes`: Array (default: image types)

#### 2. TourImageEndpoints
**Location**: `src/endpoints/TourImageEndpoints.js`

**Functions**:
- `uploadTourImages(tourId, files, isPrimary)`
- `getTourImages(tourId)`
- `deleteTourImage(tourId, imageId)`
- `updateTourImage(tourId, imageId, isPrimary)`

### Integration

#### CreateTourForm Integration
The `CreateTourForm` component has been updated to:
1. Create tour first
2. Show image upload section after successful tour creation
3. Use actual image URLs instead of placeholders
4. Provide validation and error handling

#### Workflow
1. User fills tour details
2. User clicks "Create Tour"
3. Tour is created and tour ID is returned
4. Image upload section becomes available
5. User can upload multiple images
6. First uploaded image is automatically set as primary
7. User can manage images (set primary, delete)

## Usage Examples

### Basic Usage
```jsx
import TourImageUpload from './components/TourImageUpload';

<TourImageUpload
    tourId={123}
    onImagesUpdate={(images) => console.log('Images updated:', images)}
/>
```

### With Custom Configuration
```jsx
<TourImageUpload
    tourId={123}
    maxFiles={10}
    maxFileSize={5 * 1024 * 1024} // 5MB
    acceptedTypes={['image/jpeg', 'image/png']}
    onImagesUpdate={handleImagesUpdate}
/>
```

## Testing

### Test Page
A test page is available at `src/pages/TourImageTest.jsx` for testing the image upload functionality.

**Features**:
- Enter tour ID for testing
- Real-time image preview
- Upload status display
- Error handling demonstration

### Manual Testing Steps
1. Create a tour using the CreateTourForm
2. Note the tour ID from the success message
3. Navigate to the test page
4. Enter the tour ID
5. Upload test images
6. Verify primary image functionality
7. Test image deletion

## Error Handling

### Common Errors
1. **File Type Not Supported**: Only image files allowed
2. **File Too Large**: Maximum 10MB per file
3. **Too Many Files**: Maximum 20 images per tour
4. **Permission Denied**: Only tour owners can upload
5. **Network Errors**: Automatic retry with global fetch interceptor

### Error Display
- Real-time validation messages
- Upload progress indicators
- Clear error messages with suggestions
- Graceful fallbacks

## Security Considerations

### Backend Security
- File type validation
- File size limits
- Permission checks
- Tour ownership verification
- Input sanitization

### Frontend Security
- Client-side validation
- Secure file handling
- No sensitive data in URLs
- Proper error handling

## Performance Optimizations

### Backend
- Efficient file processing
- Optimized database queries
- S3 upload optimization
- Proper error handling

### Frontend
- Lazy loading of images
- Optimized file validation
- Efficient state management
- Minimal re-renders

## Future Enhancements

### Potential Improvements
1. **Image Compression**: Automatic image compression before upload
2. **Thumbnail Generation**: Generate thumbnails for faster loading
3. **Bulk Operations**: Select multiple images for bulk actions
4. **Image Cropping**: Built-in image cropping functionality
5. **Drag and Drop Reordering**: Reorder images by dragging
6. **Image Gallery**: Full-screen image gallery view
7. **Watermarking**: Automatic watermark addition
8. **CDN Integration**: Use CDN for faster image delivery

## Troubleshooting

### Common Issues
1. **Upload Fails**: Check file type and size
2. **Permission Errors**: Verify tour ownership
3. **Network Issues**: Check internet connection
4. **Image Not Displaying**: Verify image URL accessibility

### Debug Information
- Console logs for upload progress
- Network tab for API calls
- Error messages in UI
- Backend logs for server-side issues 