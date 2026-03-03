document.addEventListener('DOMContentLoaded', () => {
    const footerContainer = document.getElementById('footer-placeholder');

    if (footerContainer) {
        fetch('footer.html')
            .then(response => {
                if (!response.ok) throw new Error("No se pudo encontrar el archivo footer.html");
                return response.text();
            })
            .then(data => {
                footerContainer.innerHTML = data;
            })
            .catch(error => console.error('Error cargando el footer:', error));
    } else {
        console.error("No se encontró un elemento con el ID 'footer-placeholder' en el HTML.");
    }
});