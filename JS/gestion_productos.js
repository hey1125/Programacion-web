document.addEventListener("DOMContentLoaded", () => {

    const botonesEliminar = document.querySelectorAll(".eliminar");

    botonesEliminar.forEach(boton => {

        boton.addEventListener("click", () => {

            const fila = boton.closest("tr");

            const confirmar = confirm("¿Desea eliminar este producto?");

            if(confirmar){
                fila.remove();
            }

        });

    });

});