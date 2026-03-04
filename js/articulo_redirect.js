document.addEventListener("DOMContentLoaded", function() {

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.addEventListener("click", function(e) {


            if (!e.target.classList.contains("btn-add")) {
                window.location.href = "./aticulo.html";
            }

        });
    });

});