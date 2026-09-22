// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const ordersResponse =
            await fetch(
                "/api/admin/orders"
            );


        if (
            ordersResponse.status === 401
        ) {

            window.location.href =
                "/admin-login.html";

            return;
        }


        const ordersData =
            await ordersResponse.json();


        if (ordersData.success) {

            const element =
                document.getElementById(
                    "orderCount"
                );


            if (element) {

                element.textContent =
                    ordersData.orders.length;
            }
        }


        const productsResponse =
            await fetch(
                "/api/admin/products"
            );


        if (
            productsResponse.status === 401
        ) {

            window.location.href =
                "/admin-login.html";

            return;
        }


        const productsData =
            await productsResponse.json();


        if (
            productsData.success
        ) {

            const element =
                document.getElementById(
                    "productCount"
                );


            if (element) {

                element.textContent =
                    productsData.products.length;
            }
        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );
    }
}


// ==========================================
// LOGOUT
// ==========================================

const logoutButton =
    document.getElementById(
        "logoutBtn"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            await fetch(
                "/api/admin/logout",
                {
                    method: "POST"
                }
            );


            window.location.href =
                "/admin-login.html";
        }
    );
}


loadDashboard();