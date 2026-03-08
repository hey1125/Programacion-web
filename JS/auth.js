document.addEventListener("DOMContentLoaded", () => {

    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    //Transición entre iniciar sesión y registrarse
    tabLogin.addEventListener("click", () => {

        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");

        loginForm.classList.add("active");
        registerForm.classList.remove("active");

    });

    tabRegister.addEventListener("click", () => {

        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");

        registerForm.classList.add("active");
        loginForm.classList.remove("active");

    });

    function configureValidation(form) {

        const email = form.querySelector("input[type='email']");
        const password = form.querySelector("input[type='password']");

        //Validaciones del email
        email.addEventListener("invalid", function () {

            if (email.validity.valueMissing) {
                email.setCustomValidity("Por favor ingresa tu correo electrónico");
            }

            else if (email.validity.typeMismatch) {
                email.setCustomValidity("Por favor ingresa un correo electrónico válido");
            }

        });

        email.addEventListener("input", function () {
            email.setCustomValidity("");
        });

        //Validaciones de contraseña
        password.addEventListener("invalid", function () {

            if (password.validity.valueMissing) {
                password.setCustomValidity("Por favor ingresa tu contraseña");
            }

        });

        password.addEventListener("input", function () {
            password.setCustomValidity("");
        });

    }

    //Aplicar validaciones
    configureValidation(loginForm);
    configureValidation(registerForm);

    //Simular login y redireccionar a home
    loginForm.addEventListener("submit", (e) => {

        e.preventDefault();

        /* redirección simulada */

        window.location.href = "home.html";

    });

    //Simular registro
    registerForm.addEventListener("submit", (e) => {

        e.preventDefault();

        alert("Registro exitoso (simulado)");

    });

});