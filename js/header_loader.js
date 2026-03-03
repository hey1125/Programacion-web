document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('header-placeholder');

    if (headerContainer) {
        fetch('header.html')
            .then(response => {
                if (!response.ok) throw new Error("No se pudo encontrar el archivo header.html");
                return response.text();
            })
            .then(data => {
                headerContainer.innerHTML = data;
            })
            .catch(error => console.error('Error cargando el header:', error));
    } else {
        console.error("No se encontró un elemento con el ID 'header-placeholder' en el HTML.");
    }
});