const CreateTours = async (tourTitle, tourDescription, tourImage, tourPrice, tourDestination, tourPrimaryImageURL, imageList, token) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/tours`, {
        method: 'POST',
        headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            catalogueId: 1, // Assuming a static catalogue ID for now
            title: tourTitle,
            destination: tourDestination,
            price: tourPrice,
            description: tourDescription,
            coverImage: tourImage,
            primaryImageURL: tourPrimaryImageURL,
            imageList: imageList
        })
    });
    return response;
}

export default CreateTours