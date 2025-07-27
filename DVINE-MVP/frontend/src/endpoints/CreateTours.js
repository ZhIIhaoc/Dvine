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

export default CreateTours;