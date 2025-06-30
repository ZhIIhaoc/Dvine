const CreateTours = async (tourTitle, tourDescription, tourImage) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/catalogues`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: tourTitle,
            description: tourDescription,
            coverImage: tourImage,
        })
    });
    return response;
}

export default CreateTours