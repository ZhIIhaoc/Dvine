const DeleteCatalogue = async (token, catalogueId) => {
    const localHost = "http://localhost:8080";
    const response = await fetch(`${localHost}/catalogues?catalogueId=${catalogueId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'

        },
    });
    return response;
}

export default DeleteCatalogue;