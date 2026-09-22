const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const message =
    document.getElementById("message");


// ==========================================
// LOGIN TAB
// ==========================================

loginTab.addEventListener(
    "click",
    () => {

        loginTab.classList.add(
            "active"
        );

        registerTab.classList.remove(
            "active"
        );

        loginForm.classList.remove(
            "hidden"
        );

        registerForm.classList.add(
            "hidden"
        );

        message.textContent = "";
    }
);


// ==========================================
// REGISTER TAB
// ==========================================

registerTab.addEventListener(
    "click",
    () => {

        registerTab.classList.add(
            "active"
        );

        loginTab.classList.remove(
            "active"
        );

        registerForm.classList.remove(
            "hidden"
        );

        loginForm.classList.add(
            "hidden"
        );

        message.textContent = "";
    }
);


// ==========================================
// CUSTOMER LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document.getElementById(
                "loginEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "loginPassword"
            ).value;


        message.textContent =
            "Logging in...";


        try {

            const response =
                await fetch(
                    "/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


            const data =
                await response.json();


            message.textContent =
                data.message;


            if (data.success) {

                message.className =
                    "success";


                setTimeout(
                    () => {

                        window.location.href =
                            "/store1";

                    },
                    500
                );

            } else {

                message.className =
                    "error";
            }


        } catch (error) {

            console.error(error);

            message.textContent =
                "Server connection failed";

            message.className =
                "error";
        }
    }
);


// ==========================================
// REGISTER
// ==========================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            document.getElementById(
                "regName"
            ).value.trim();


        const email =
            document.getElementById(
                "regEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "regPassword"
            ).value;


        message.textContent =
            "Creating account...";


        try {

            const response =
                await fetch(
                    "/api/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })
                    }
                );


            const data =
                await response.json();


            message.textContent =
                data.message;


            if (data.success) {

                message.className =
                    "success";


                setTimeout(
                    () => {

                        window.location.href =
                            "/store1";

                    },
                    500
                );

            } else {

                message.className =
                    "error";
            }


        } catch (error) {

            console.error(error);

            message.textContent =
                "Server connection failed";

            message.className =
                "error";
        }
    }
);