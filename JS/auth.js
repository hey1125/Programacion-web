const API_URL = `${window.location.origin}/api/users`;

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

    //Login de usuario y redireccionar a home
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector("input[type='email']").value;
        const password = loginForm.querySelector("input[type='password']").value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Error al iniciar sesión");
                return;
            }

            //Guardar token
            localStorage.setItem("token", data.token);

            //Redirigir
            window.location.href = "home.html";

        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
        }
    });

    //Registro de usuario
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = registerForm.querySelector("input[name='name']").value;
        const email = registerForm.querySelector("input[type='email']").value;
        const password = registerForm.querySelector("input[type='password']").value;

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Error en el registro");
                return;
            }

            alert("Registro exitoso");

            //Opcional: guardar token automáticamente
            localStorage.setItem("token", data.token);

            //Cambiar a login
            tabLogin.click();

        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
        }
    });

});