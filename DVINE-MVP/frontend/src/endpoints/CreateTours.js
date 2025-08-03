const CreateTours = async (tourTitle, tourDescription, tourDestination, tourPrice, tourPrimaryImageURL, imageList, token, chosenCatalogueId) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/tours`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            catalogueId: chosenCatalogueId,
            title: tourTitle,
            destination: tourDestination,
            regularPrice: parseFloat(tourPrice),
            premiumPrice: 3,
            description: tourDescription,
            primaryImageUrl: tourPrimaryImageURL,
            images: imageList
        })
    });
    return response;
}

// New function to create tour with image files
const CreateToursWithImages = async (tourData, imageFiles) => {
    const localHost = "http://localhost:8080";
    
    // First, create the tour without images
    const tourResponse = await fetch(`${localHost}/tours`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            catalogueId: tourData.catalogueId,
            title: tourData.title,
            destination: tourData.destination,
            regularPrice: parseFloat(tourData.regularPrice),
            premiumPrice: parseFloat(tourData.premiumPrice) || parseFloat(tourData.regularPrice),
            description: tourData.description,
            primaryImageUrl: tourData.primaryImageUrl || "",
            images: tourData.images || []
        })
    });

    const tourResult = await tourResponse.json();
    
    // Check if this is a TourSubmittedException (202 status)
    if (tourResponse.status === 202) {
        // Tour was submitted for approval - this is expected for partners
        return {
            ...tourResult,
            message: "Tour submitted for approval. You can upload images after the tour is approved by an administrator.",
            requiresApproval: true
        };
    }
    
    if (tourResult.code !== 0) {
        throw new Error(tourResult.msg || 'Failed to create tour');
    }

    const tourId = tourResult.data?.tourId;
    
    if (!tourId) {
        throw new Error('Tour created but no tour ID returned');
    }

    // If there are image files, upload them (only for Manager/Owner who can create tours directly)
    if (imageFiles && imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file, index) => {
            formData.append('files', file);
        });

        // Set the first image as primary
        const isPrimary = true;
        
        const imageResponse = await fetch(`${localHost}/tours/${tourId}/images?isPrimary=${isPrimary}`, {
            method: 'POST',
            body: formData
        });

        const imageResult = await imageResponse.json();
        
        if (imageResult.code !== 0) {
            console.warn('Tour created but image upload failed:', imageResult.msg);
        }
    }

    return tourResult;
}

export { CreateTours, CreateToursWithImages };
export default CreateTours;