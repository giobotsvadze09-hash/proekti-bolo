const apiKey = "2493aec7-2817-4674-af86-3cc1e70ca721";
const token = localStorage.getItem("accessToken");

// კალათის მონაცემების წამოღება და გამოტანა
async function loadCart() {
    if (!token) {
        alert("გთხოვთ გაიაროთ ავტორიზაცია!");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("https://restaurantapi.stepacademy.ge/api/cart", {
            method: "GET",
            headers: {
                "Accept": "*/*",
                "X-API-KEY": apiKey,
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.data) {
            renderCartItems(data.data.items);
        } else {
            console.error("კალათის ჩატვირთვა ვერ მოხერხდა");
        }
    } catch (err) {
        console.error("კავშირის შეცდომა:", err);
    }
}

// კალათის პროდუქტების ეკრანზე გამოტანა და თანხების დათვლა
function renderCartItems(items) {
    const cartContainer = document.getElementById("cartItemsContainer");
    const subtotalElement = document.getElementById("subtotalPrice");
    const taxElement = document.getElementById("taxPrice");
    const totalPriceElement = document.getElementById("totalPrice");
    const cartTitleSection = document.querySelector(".shopping-cart, h1")?.nextElementSibling;

    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    if (!items || items.length === 0) {
        cartContainer.innerHTML = `<p style="color: #777; font-size: 16px;">თქვენი კალათა ცარიელია</p>`;
        if (subtotalElement) subtotalElement.textContent = "0.00 ₾";
        if (taxElement) taxElement.textContent = "0.00 ₾";
        if (totalPriceElement) totalPriceElement.textContent = "0.00 ₾";
        if (cartTitleSection && cartTitleSection.tagName === 'P') {
            cartTitleSection.textContent = "0 items";
        }
        return;
    }

    let calculatedSubtotal = 0;
    let totalItemsCount = 0;

    items.forEach(item => {
        const cartItemId = item.id; 
        const productId = item.product.id; 
        const itemTotal = item.product.price * item.quantity;
        calculatedSubtotal += itemTotal;
        totalItemsCount += item.quantity;

        const itemElement = document.createElement("div");
        itemElement.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            gap: 20px;
        `;

        itemElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${item.product.image}" alt="${item.product.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
                <div>
                    <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${item.product.name}</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">ფასი: <b>${item.product.price} ₾</b></p>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
                    <button type="button" class="decrease-btn" data-cart-id="${cartItemId}" data-qty="${item.quantity - 1}" style="background: #f8f9fa; border: none; padding: 6px 12px; cursor: pointer; font-weight: bold; font-size: 14px;">-</button>
                    <span style="padding: 0 12px; font-weight: 500; font-size: 14px;">${item.quantity}</span>
                    <button type="button" class="increase-btn" data-product-id="${productId}" style="background: #f8f9fa; border: none; padding: 6px 12px; cursor: pointer; font-weight: bold; font-size: 14px;">+</button>
                </div>
                <button type="button" class="remove-btn" data-cart-id="${cartItemId}" style="background: transparent; border: none; color: #ff4d4d; cursor: pointer; font-size: 14px; font-weight: 500;">წაშლა</button>
            </div>
        `;
        cartContainer.appendChild(itemElement);
    });

    if (cartTitleSection && cartTitleSection.tagName === 'P') {
        cartTitleSection.textContent = `${totalItemsCount} items`;
    }

    const tax = calculatedSubtotal * 0.10;
    const finalTotal = calculatedSubtotal + tax;

    if (subtotalElement) subtotalElement.textContent = `${calculatedSubtotal.toFixed(2)} ₾`;
    if (taxElement) taxElement.textContent = `${tax.toFixed(2)} ₾`;
    if (totalPriceElement) totalPriceElement.textContent = `${finalTotal.toFixed(2)} ₾`;

    // პლუს ღილაკი
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const productId = button.getAttribute('data-product-id');
            await addToCart(productId);
        });
    });

    // მინუს ღილაკი
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const cartId = button.getAttribute('data-cart-id');
            const newQty = parseInt(button.getAttribute('data-qty'));
            await changeQuantity(cartId, newQty);
        });
    });

    // წაშლა ღილაკი
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const cartId = button.getAttribute('data-cart-id');
            await removeItem(cartId);
        });
    });
}

// პროდუქტის დამატება (პლუსისთვის)
async function addToCart(productId) {
    try {
        const response = await fetch("https://restaurantapi.stepacademy.ge/api/cart/add-to-cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "X-API-KEY": apiKey,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: Number(productId),
                quantity: 1
            })
        });

        if (response.ok) {
            loadCart();
        } else {
            console.error("რაოდენობის მომატება ვერ მოხერხდა");
        }
    } catch (err) {
        console.error(err);
    }
}

// რაოდენობის შეცვლა (მინუსისთვის)
async function changeQuantity(cartItemId, newQuantity) {
    if (newQuantity <= 0) {
        removeItem(cartItemId);
        return;
    }

    try {
        const response = await fetch("https://restaurantapi.stepacademy.ge/api/cart/edit-quantity", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "X-API-KEY": apiKey,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id: Number(cartItemId),
                quantity: Number(newQuantity)
            })
        });

        if (response.ok) {
            loadCart(); 
        } else {
            console.error("რაოდენობის შეცვლა ვერ მოხერხდა");
        }
    } catch (err) {
        console.error(err);
    }
}

// პროდუქტის წაშლა კალათიდან
async function removeItem(cartItemId) {
    try {
        const response = await fetch(`https://restaurantapi.stepacademy.ge/api/cart/remove-from-cart/${cartItemId}`, {
            method: "DELETE",
            headers: {
                "Accept": "*/*",
                "X-API-KEY": apiKey,
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadCart(); 
        } else {
            console.error("პროდუქტის წაშლა ვერ მოხერხდა");
        }
    } catch (err) {
        console.error(err);
    }
}

// შეკვეთის გაფორმება (Checkout)
const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("https://restaurantapi.stepacademy.ge/api/cart/checkout?Take=10&Page=1", {
                method: "POST",
                headers: {
                    "Accept": "*/*",
                    "X-API-KEY": apiKey,
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("შეკვეთა წარმატებით გაფორმდა!");
                window.location.href = "index.html";
            } else {
                alert("შეკვეთის გაფორმება ვერ მოხერხდა.");
            }
        } catch (err) {
            console.error(err);
            alert("კავშირის შეცდომა შეკვეთისას.");
        }
    });
}

// გვერდის ჩატვირთვისას ავტომატურად ვუძახით კალათის წამოღებას
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});