const cartContainer =
    document.getElementById(
        "cartContainer"
    );

const checkoutBox =
    document.getElementById(
        "checkoutBox"
    );

const message =
    document.getElementById(
        "message"
    );


// ==========================================
// LOAD CART
// ==========================================

async function loadCart() {

    try {

        const response =
            await fetch(
                "/api/cart"
            );


        const data =
            await response.json();


        if (!response.ok) {

            window.location.href =
                "/login.html";

            return;
        }


        if (
            !data.items ||
            data.items.length === 0
        ) {

            cartContainer.innerHTML = `

                <div class="empty">

                    <h2>
                        Cart is empty
                    </h2>

                    <a
                        href="/store1"
                        class="primary-btn"
                    >
                        Start Shopping
                    </a>

                </div>

            `;


            checkoutBox.classList.add(
                "hidden"
            );

            return;
        }


        checkoutBox.classList.remove(
            "hidden"
        );


        let html = "";


        data.items.forEach(
            item => {

                const subtotal =
                    Number(item.price) *
                    Number(item.quantity);


                html += `

                    <div class="cart-item">

                        <div class="cart-info">

                            <span class="cart-emoji">
                                ${item.emoji}
                            </span>

                            <div>

                                <h3>
                                    ${item.name}
                                </h3>

                                <p>
                                    ₹${item.price}
                                    / ${item.unit}
                                </p>

                            </div>

                        </div>


                        <div>

                            <input
                                class="qty"
                                type="number"
                                min="1"
                                value="${item.quantity}"
                                onchange="
                                    updateCart(
                                        ${item.productId},
                                        this.value
                                    )
                                "
                            >

                        </div>


                        <strong>
                            ₹${subtotal.toFixed(2)}
                        </strong>


                        <button
                            class="danger-btn"
                            onclick="
                                removeCart(
                                    ${item.productId}
                                )
                            "
                        >
                            Remove
                        </button>

                    </div>

                `;
            }
        );


        html += `

            <div class="cart-total">

                Total:
                ₹${Number(data.total).toFixed(2)}

            </div>

        `;


        cartContainer.innerHTML =
            html;


    } catch (error) {

        console.error(error);

        cartContainer.innerHTML =
            "Server error";
    }
}


// ==========================================
// UPDATE
// ==========================================

async function updateCart(
    productId,
    quantity
) {

    await fetch(
        "/api/cart/update",
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                productId,

                quantity:
                    Number(quantity)

            })
        }
    );


    loadCart();
}


// ==========================================
// REMOVE
// ==========================================

async function removeCart(
    productId
) {

    await fetch(
        `/api/cart/remove/${productId}`,
        {
            method: "DELETE"
        }
    );


    loadCart();
}


// ==========================================
// CHECKOUT
// ==========================================

document
    .getElementById(
        "checkoutBtn"
    )
    .addEventListener(
        "click",
        async () => {

            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            if (!phone) {

                message.textContent =
                    "Please enter phone number";

                message.className =
                    "error";

                return;
            }


            try {

                const response =
                    await fetch(
                        "/api/checkout",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                storeSlug:
                                    "store1",

                                phone
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

                    loadCart();

                } else {

                    message.className =
                        "error";
                }


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Checkout failed";

                message.className =
                    "error";
            }
        }
    );


loadCart();