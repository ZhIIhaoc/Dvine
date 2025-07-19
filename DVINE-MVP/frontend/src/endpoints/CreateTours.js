const CreateTours = async (tourTitle, tourDescription, tourDestination, tourPrice, tourPrimaryImageURL, imageList, token, chosenCatalogueId) => {
    const localHost = "http://localhost:8080";
    console.log(chosenCatalogueId);
    const response = await fetch(`${localHost}/tours`, {
        method: 'POST',
        headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            catalogueId: chosenCatalogueId, // Assuming a static catalogue ID for now
            title: tourTitle,
            destination: tourDestination,
            price: parseFloat(tourPrice),
            description: tourDescription,
            primaryImageUrl: tourPrimaryImageURL,
            images: imageList
        })
    });
    return response;
}

export default CreateTours;