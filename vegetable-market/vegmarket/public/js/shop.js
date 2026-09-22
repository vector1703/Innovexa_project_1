const productsContainer =
    document.getElementById(
        "products"
    );

const message =
    document.getElementById(
        "message"
    );


// ==========================================
// LOAD STORE
// ==========================================

async function loadStore() {

    try {

        const response =
            await fetch(
                "/api/store/store1"
            );


        const data =
            await response.json();


        if (data.success) {

            document.getElementById(
                "storeName"
            ).textContent =
                data.store.name;
        }


    } catch (error) {

        console.error(error);

    }
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    try {

        const response =
            await fetch(
                "/api/store/store1/products"
            );


        const data =
            await response.json();


        if (!data.success) {

            productsContainer.innerHTML =
                "<p>Cannot load products.</p>";

            return;
        }


        productsContainer.innerHTML =
            "";


        data.products.forEach(
            product => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "product-card";


                card.innerHTML = `

                    <div class="product-emoji">
                        ${product.emoji}
                    </div>

                    <h3>
                        ${product.name}
                    </h3>

                    <p class="price">
                        ₹${product.price}
                        / ${product.unit}
                    </p>

                    <p>
                        Stock:
                        ${product.stock}
                    </p>

                    <button
                        class="primary-btn full"
                        onclick="addToCart(${product.id})"
                    >
                        Add to Cart
                    </button>

                `;


                productsContainer.appendChild(
                    card
                );
            }
        );


    } catch (error) {

        console.error(error);

        productsContainer.innerHTML =
            "<p>Server error.</p>";
    }
}


// ==========================================
// ADD CART
// ==========================================

async function addToCart(
    productId
) {

    try {

        const response =
            await fetch(
                "/api/cart/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        productId,

                        quantity: 1

                    })
                }
            );


        const data =
            await response.json();


        message.textContent =
            data.message;


        message.className =
            data.success
                ? "success"
                : "error";


    } catch (error) {

        console.error(error);

        message.textContent =
            "Cannot add product";

        message.className =
            "error";
    }
}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            await fetch(
                "/api/logout",
                {
                    method: "POST"
                }
            );


            window.location.href =
                "/";
        }
    );


loadStore();

loadProducts();