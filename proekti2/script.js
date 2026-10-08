const apiKey = "2493aec7-2817-4674-af86-3cc1e70ca721";
const apiUrl = "https://restaurantapi.stepacademy.ge/api/products/filter";
const productsUrl = "https://restaurantapi.stepacademy.ge/api/products?Take=10&Page=1";

const categoryMap = {
    "Desserts": 1,
    "First Courses": 2,
    "Main Courses": 3,
    "Pizzas": 4,
    "Side Dishes": 5,
    "Appetizers": 6,
    "დესერტები": 1,
    "პირველი კერძები": 2,
    "ძირითადი კერძები": 3,
    "პიცა": 4,
    "გარნირი": 5,
    "ხემსები": 6
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. მუდმივად ვამოწმებთ კალათის რაოდენობას ნებისმიერ გვერდზე
    updateCartCount();

    // 2. თუ ეს არის კალათის გვერდი (cart.html)
    renderCartPage();

    // 3. მთავარი/მენიუს გვერდის ლოგიკა
    try {
        const searchInput = document.getElementById("searchDish");
        const categoryCheckboxes = document.querySelectorAll(".checkbox-list input[type='checkbox']");
        const vegetarianToggle = document.querySelector(".toggle-group input[type='checkbox']");
        const clearBtn = document.querySelector(".clear-filters-btn");
        const dishesGrid = document.querySelector(".dishes-grid");
        const productsCountText = document.querySelector(".menu-header-info p");

        if (dishesGrid) {
            fetchProducts();
        }

        if (searchInput) {
            searchInput.addEventListener("input", fetchFilteredProducts);
        }

        categoryCheckboxes.forEach(cb => {
            cb.addEventListener("change", fetchFilteredProducts);
        });

        if (vegetarianToggle) {
            vegetarianToggle.addEventListener("change", fetchFilteredProducts);
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (searchInput) searchInput.value = "";
                categoryCheckboxes.forEach(cb => cb.checked = false);
                if (vegetarianToggle) vegetarianToggle.checked = false;
                fetchProducts();
            });
        }

        async function fetchProducts() {
            try {
                const response = await fetch(productsUrl, {
                    method: "GET",
                    headers: { "X-API-KEY": apiKey, "Accept": "*/*" }
                });
                const result = await response.json();
                const products = result.data.products || [];
                displayProducts(products);
                if (productsCountText) productsCountText.textContent = `Showing ${products.length} products`;
            } catch (err) { console.error(err); }
        }

        async function fetchFilteredProducts() {
            const params = new URLSearchParams();
            params.append("Take", "20");
            params.append("Page", "1");

            if (searchInput && searchInput.value.trim()) {
                params.append("Query", searchInput.value.trim());
            }

            let selectedCategory = null;
            categoryCheckboxes.forEach(cb => {
                if (cb.checked) {
                    const labelText = cb.parentElement.textContent.trim();
                    if (categoryMap[labelText]) selectedCategory = categoryMap[labelText];
                }
            });
            if (selectedCategory) params.append("CategoryId", selectedCategory);
            if (vegetarianToggle && vegetarianToggle.checked) params.append("Vegetarian", "true");

            try {
                const response = await fetch(`${apiUrl}?${params.toString()}`, {
                    method: "GET",
                    headers: { "X-API-KEY": apiKey, "Accept": "*/*" }
                });
                const result = await response.json();
                const products = result.data.products || [];
                displayProducts(products);
                if (productsCountText) productsCountText.textContent = `Showing ${products.length} products`;
            } catch (err) { console.error(err); }
        }

        function displayProducts(products) {
            if (!dishesGrid) return;
            dishesGrid.innerHTML = "";
            if (products.length === 0) {
                dishesGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">პროდუქტები ვერ მოიძებნა</p>`;
                return;
            }
            products.forEach(product => {
                const card = document.createElement("div");
                card.classList.add("dish-card");
                card.innerHTML = `
                    <div class="dish-img-container"><img src="${product.image}" alt="${product.name}"></div>
                    <div class="dish-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="dish-rating"><i class="fa-solid fa-star"></i> <span>${product.rate}</span></div>
                        <div class="dish-footer">
                            <span class="price">${product.price.toFixed(2)} ₾</span>
                            <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                `;
                dishesGrid.appendChild(card);
            });

            dishesGrid.querySelectorAll(".add-to-cart-btn").forEach(button => {
                button.addEventListener("click", () => {
                    const productId = button.getAttribute("data-id");
                    addToServerCart(productId, button);
                });
            });
        }
    } catch (e) { }

    // 4. ნავიგაციაში ავტორიზაციის და პროფილის მართვა
    try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const navRight = document.querySelector(".nav-right");

        if (currentUser && navRight) {
            navRight.innerHTML = `
                <a href="cart.html" class="cart-icon" style="position: relative; text-decoration: none; color: #333; margin-right: 15px;">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="cart-count" style="background: #ff5722; color: white; border-radius: 50%; padding: 2px 6px; font-size: 11px; position: absolute; top: -8px; right: -10px;">0</span>
                </a>
                <div class="profile-menu-container" style="position: relative; display: inline-block;">
                    <div class="profile-icon-btn" id="profileToggleBtn" style="cursor: pointer; color: #ff5722; font-size: 20px; background: #ffebee; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="profile-dropdown-menu" id="profileDropdown" style="display: none; position: absolute; right: 0; top: 50px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border-radius: 8px; width: 220px; overflow: hidden; z-index: 1000; border: 1px solid #eee;">
                        <div style="padding: 15px; border-bottom: 1px solid #eee; background: #fafafa;">
                            <p style="font-size: 12px; color: #777; margin: 0;">გამარჯობა:</p>
                            <p style="font-size: 14px; font-weight: bold; color: #333; margin: 2px 0 0 0;">${currentUser.firstName || "User"} ${currentUser.lastName || ""}</p>
                        </div>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li><a href="profile.html" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; font-size: 14px;"><i class="fa-solid fa-user-gear" style="margin-right: 8px;"></i> პროფილი</a></li>
                            <li><a href="#" id="logoutBtn" style="display: block; padding: 12px 15px; color: #e53935; text-decoration: none; font-size: 14px; border-top: 1px solid #eee;"><i class="fa-solid fa-right-from-bracket" style="margin-right: 8px;"></i> გასვლა</a></li>
                        </ul>
                    </div>
                </div>
            `;
            updateCartCount();

            const profileToggleBtn = document.getElementById("profileToggleBtn");
            const profileDropdown = document.getElementById("profileDropdown");
            const logoutBtn = document.getElementById("logoutBtn");

            if (profileToggleBtn && profileDropdown) {
                profileToggleBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
                });
                window.addEventListener("click", () => {
                    profileDropdown.style.display = "none";
                });
            }

            if (logoutBtn) {
                logoutBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("currentUser");
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "index.html";
                });
            }
        }
    } catch (e) { }

    // 5. რეგისტრაციის ფორმა
    try {
        const registerForm = document.getElementById("registerForm");
        if (registerForm) {
            registerForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const firstName = document.getElementById("firstName").value;
                const lastName = document.getElementById("lastName").value;
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;

                try {
                    const response = await fetch("https://restaurantapi.stepacademy.ge/api/auth/register", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json", 
                            "Accept": "*/*",
                            "X-API-KEY": apiKey 
                        },
                        body: JSON.stringify({ firstName, lastName, email, password })
                    });
                    
                    const data = await response.json().catch(() => ({}));
                    if (response.ok) {
                        alert("რეგისტრაცია წარმატებით დასრულდა!");
                        registerForm.reset();
                        localStorage.setItem("regEmail", email);
                        window.location.href = `verify.html?email=${encodeURIComponent(email)}`;
                    } else {
                        alert("შეცდომა რეგისტრაციისას: " + (data.detail || data.title || JSON.stringify(data.errors || data) || "უცნობი შეცდომა"));
                    }
                } catch (err) {
                    console.error(err);
                    alert("სერვერთან კავშირის შეცდომა!");
                }
            });
        }
    } catch (e) { }

    // 6. ავტორიზაციის (Login) ფორმა
    try {
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;

                try {
                    const response = await fetch("https://restaurantapi.stepacademy.ge/api/auth/login", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "*/*",
                            "X-API-KEY": apiKey 
                        },
                        body: JSON.stringify({ email, password })
                    });
                    
                    const data = await response.json().catch(() => ({}));
                    if (response.ok) {
                        alert("ავტორიზაცია წარმატებულია!");
                        const tokenData = data.data || data;
                        if (tokenData.accessToken) localStorage.setItem("accessToken", tokenData.accessToken);
                        if (tokenData.refreshToken) localStorage.setItem("refreshToken", tokenData.refreshToken);
                        
                        const userObj = { firstName: tokenData.firstName || "მომხმარებელი", lastName: tokenData.lastName || "", email: email };
                        localStorage.setItem("currentUser", JSON.stringify(userObj));
                        window.location.href = "index.html";
                    } else {
                        alert("შეცდომა შესვლისას: " + (data.detail || data.title || "არასწორი მეილი ან პაროლი"));
                    }
                } catch (err) {
                    console.error(err);
                    alert("სერვერთან კავშირის შეცდომა!");
                }
            });
        }
    } catch (e) { }
});

// პროდუქტის კალათაში დამატება სერვერზე
async function addToServerCart(productId, button) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("გთხოვთ ჯერ გაიაროთ ავტორიზაცია!");
        window.location.href = "login.html";
        return;
    }

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
                productId: parseInt(productId),
                quantity: 1
            })
        });

        if (response.ok) {
            if (button) {
                button.textContent = "Added!";
                button.style.backgroundColor = "#4CAF50";
                setTimeout(() => {
                    button.textContent = "Add to Cart";
                    button.style.backgroundColor = "";
                }, 1000);
            }
            updateCartCount();
        } else {
            alert("კალათაში დამატება ვერ მოხერხდა.");
        }
    } catch (err) {
        console.error(err);
    }
}

// კალათაში პროდუქტების საერთო რაოდენობის განახლება (badge)
async function updateCartCount() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
        const response = await fetch("https://restaurantapi.stepacademy.ge/api/cart", {
            method: "GET",
            headers: {
                "Accept": "*/*",
                "X-API-KEY": apiKey,
                "Authorization": `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (response.ok && result.data) {
            const items = result.data.items || [];
            let totalCount = 0;
            items.forEach(item => totalCount += item.quantity);
            
            document.querySelectorAll(".cart-count").forEach(el => {
                el.textContent = totalCount;
            });
        }
    } catch (err) {
        console.error(err);
    }
}

// კალათის გვერდის რენდერი და თანხების გამოთვლა
async function renderCartPage() {
    const itemsWrapper = document.getElementById("cartItemsContainer") || document.querySelector(".cart-items-container");
    if (!itemsWrapper) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
        itemsWrapper.innerHTML = `<p style="text-align: center; color: #777; padding: 40px; font-size: 1.1rem;">გთხოვთ გაიაროთ ავტორიზაცია</p>`;
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
        const result = await response.json();

        if (!response.ok || !result.data || !result.data.items || result.data.items.length === 0) {
            itemsWrapper.innerHTML = `<p style="text-align: center; color: #777; padding: 40px; font-size: 1.1rem;">თქვენი კალათა ცარიელია</p>`;
            updateSummary(0, 0);
            return;
        }

        const items = result.data.items;
        itemsWrapper.innerHTML = "";

        let calculatedSubtotal = 0;
        let totalItemsCount = 0;

        const itemsCountText = document.querySelector(".items-count-text") || document.querySelector(".cart-section > p");
        
        items.forEach(item => {
            const product = item.product;
            const itemTotal = product.price * item.quantity;
            calculatedSubtotal += itemTotal;
            totalItemsCount += item.quantity;

            const card = document.createElement("div");
            card.classList.add("cart-item-card");
            card.style.cssText = "display: flex; align-items: flex-start; justify-content: space-between; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; border: 1px solid #eee;";

            card.innerHTML = `
                <div style="display: flex; gap: 20px; align-items: flex-start;">
                    <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; font-size: 1.1rem; color: #111; font-weight: bold;">${product.name}</h4>
                        <p style="margin: 0 0 12px 0; color: #666; font-size: 0.85rem; max-width: 400px;">${product.description || ""}</p>
                        <div style="font-size: 0.9rem; color: #444; margin-bottom: 8px;">ფასი: <b>${product.price.toFixed(2)} ₾</b></div>
                        <div style="display: inline-flex; align-items: center; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; background: #fff;">
                            <button onclick="changeQuantity(${item.id}, ${item.quantity - 1})" style="background: #fff; border: none; padding: 5px 12px; cursor: pointer; font-size: 1rem;">-</button>
                            <span style="padding: 0 12px; font-weight: 600; font-size: 0.95rem;">${item.quantity}</span>
                            <button onclick="changeQuantity(${item.id}, ${item.quantity + 1})" style="background: #fff; border: none; padding: 5px 12px; cursor: pointer; font-size: 1rem;">+</button>
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; height: 100%; min-height: 90px;">
                    <button onclick="removeItem(${item.id})" style="background: transparent; border: none; color: #e53935; cursor: pointer; font-size: 1.1rem; padding: 0;">
                        <i class="fa-solid fa-trash"></i> წაშლა
                    </button>
                    <div style="text-align: right; margin-top: 25px;">
                        <div style="font-weight: bold; font-size: 1.1rem; color: #ff5722; margin-top: 2px;">ჯამი: ${itemTotal.toFixed(2)} ₾</div>
                    </div>
                </div>
            `;
            itemsWrapper.appendChild(card);
        });

        if (itemsCountText) {
            itemsCountText.textContent = `${totalItemsCount} items`;
        }

        const tax = calculatedSubtotal * 0.10;
        updateSummary(calculatedSubtotal, tax);
        updateCartCount();
    } catch (err) {
        console.error(err);
    }
}

// რაოდენობის შეცვლა კალათაში
async function changeQuantity(cartItemId, newQuantity) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

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
                id: cartItemId,
                quantity: newQuantity
            })
        });

        if (response.ok) {
            renderCartPage();
            updateCartCount();
        } else {
            alert("რაოდენობის შეცვლა ვერ მოხერხდა.");
        }
    } catch (err) {
        console.error(err);
    }
}

// პროდუქტის წაშლა კალათიდან
async function removeItem(cartItemId) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

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
            renderCartPage();
            updateCartCount();
        } else {
            alert("პროდუქტის წაშლა ვერ მოხერხდა.");
        }
    } catch (err) {
        console.error(err);
    }
}

// შეკვეთის ჯამების განახლება (Order Summary)
function updateSummary(subtotal, tax) {
    let total = subtotal + tax;

    const subtotalEl = document.getElementById("subtotalPrice");
    const taxEl = document.getElementById("taxPrice");
    const totalEl = document.getElementById("totalPrice");

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} ₾`;
    if (taxEl) taxEl.textContent = `${tax.toFixed(2)} ₾`;
    if (totalEl) totalEl.textContent = `${total.toFixed(2)} ₾`;
}

// შეკვეთის გაფორმება (Checkout)
document.addEventListener("click", async (e) => {
    if (e.target && e.target.id === "checkoutBtn") {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

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
        }
    }
});