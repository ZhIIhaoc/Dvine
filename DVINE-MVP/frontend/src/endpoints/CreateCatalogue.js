const CreateCatalogue = async (token, title, description, image) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/catalogues`, {
        method: 'POST',
        headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            title: title,
            description: description,
            coverImage: image,
        })
    });
    return response;
};

export default CreateCatalogue;