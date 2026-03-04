document.addEventListener("DOMContentLoaded", function() {

    const imagenPrincipal = document.getElementById("imagenPrincipal");

    if (!imagenPrincipal) {
        console.log("No se encontró imagenPrincipal");
        return;
    }

    const miniaturas = document.querySelectorAll(".miniaturas img");

    console.log("Miniaturas encontradas:", miniaturas.length);

    miniaturas.forEach(function(img) {
        img.addEventListener("click", function() {
            imagenPrincipal.src = this.src;
            console.log("Imagen cambiada");
        });
    });

});