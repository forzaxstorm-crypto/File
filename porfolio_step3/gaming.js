function isValidCartItem(item) {
        return item !== null
            && typeof item === "object"
            && typeof item.name === "string"
            && item.name.trim().length > 0
            && item.name.length <= 200
            && Number.isFinite(item.price)
            && item.price >= 0
            && Number.isSafeInteger(item.quantity)
            && item.quantity > 0;
    }

    function loadCart() {
        try {
            const storedCart = localStorage.getItem("gamingCart");

            if (storedCart === null) {
                return [];
            }

            const parsedCart = JSON.parse(storedCart);

            if (!Array.isArray(parsedCart)) {
                throw new TypeError("Saved cart data is not an array.");
            }

            const validCart = parsedCart.filter(isValidCartItem);

            if (validCart.length !== parsedCart.length) {
                console.error("Some invalid items were skipped while loading the cart.");
            }

            return validCart;
        } catch (error) {
            console.error("Could not load the saved cart from localStorage:", error);
            return [];
        }
    }

    let cart = loadCart();
    const cartItemByElement = new WeakMap();
    const pendingRemovals = new WeakSet();

    const cartOpen = document.getElementById("cart-open");
    const cartClose = document.getElementById("cart-close");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");
const cartToast = document.getElementById("cart-toast");
    const cartToastMessage = document.getElementById("cart-toast-message");
    const cartModal = document.querySelector(".cart-modal");
    const backgroundInertState = new Map();
    let cartOpener = null;
let toastTimer;

 // Кнопка корзины в футере

    function openCart(opener) {
        if (cartOverlay.classList.contains("active")) return;

        cartOpener = opener;

        Array.from(document.body.children).forEach(element => {
            if (element !== cartOverlay) {
                backgroundInertState.set(element, element.inert);
                element.inert = true;
            }
        });

        cartOverlay.classList.add("active");
        cartClose.focus();
    }

    function closeCart() {
        if (!cartOverlay.classList.contains("active")) return;

        cartOverlay.classList.remove("active");

        backgroundInertState.forEach((wasInert, element) => {
            element.inert = wasInert;
        });
        backgroundInertState.clear();

        if (cartOpener && cartOpener.isConnected) {
            cartOpener.focus();
        }

        cartOpener = null;
    }

document.addEventListener("click", (event) => {
    const footerCartButton = event.target.closest("#footer-cart-link");

    if (footerCartButton) {
        openCart(footerCartButton);
    }
});

function showCartToast() {
    cartToastMessage.textContent = "Товар добавлен в корзину";
    cartToast.classList.add("show");

    cartOpen.classList.remove("cart-active");
void cartOpen.offsetWidth;
cartOpen.classList.add("cart-active");

setTimeout(() => {
    cartOpen.classList.remove("cart-active");
}, 550);

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        cartToast.classList.remove("show");
        setTimeout(() => {
            if (!cartToast.classList.contains("show")) {
                cartToastMessage.textContent = "";
            }
        }, 350);
    }, 1800);
}

    // Открытие и закрытие корзины
    cartOpen.addEventListener("click", () => {
        openCart(cartOpen);
    });

    cartClose.addEventListener("click", () => {
        closeCart();
    });

    cartOverlay.addEventListener("click", (event) => {
        if (event.target === cartOverlay) {
            closeCart();
        }
    });

    document.addEventListener("keydown", event => {
        if (!cartOverlay.classList.contains("active")) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeCart();
            return;
        }

        if (event.key !== "Tab") return;

        const focusableElements = Array.from(cartModal.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));

        if (focusableElements.length === 0) {
            event.preventDefault();
            cartModal.focus();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const focusedElement = document.activeElement;

        if (!cartModal.contains(focusedElement)) {
            event.preventDefault();
            (event.shiftKey ? lastElement : firstElement).focus();
        } else if (focusedElement === cartModal) {
            event.preventDefault();
            (event.shiftKey ? lastElement : firstElement).focus();
        } else if (event.shiftKey && focusedElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && focusedElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });

    // Добавление товаров
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            const existingItem = cart.find(item => item.name === name);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }

            updateCart();

            button.textContent = "ДОБАВЛЕНО ✓";
            showCartToast();

button.classList.remove("added");
void button.offsetWidth;
button.classList.add("added");

setTimeout(() => {
    button.classList.remove("added");
}, 550);

            setTimeout(() => {
                button.textContent = "В КОРЗИНУ";
            }, 1000);
        });
    });

    // Обновление корзины
    function updateCart() {
        const focusedCartButton = cartItems.contains(document.activeElement)
            ? document.activeElement
            : null;
        const focusedItem = focusedCartButton
            && cartItemByElement.get(focusedCartButton.closest(".cart-item"));
        const focusedAction = focusedCartButton && focusedCartButton.dataset.action;

        try {
            localStorage.setItem("gamingCart", JSON.stringify(cart));
        } catch (error) {
            console.error("Could not save the cart to localStorage:", error);
        }

        cartItems.textContent = "";

        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "cart-empty";
            emptyMessage.textContent = "Корзина пока пуста";
            cartItems.appendChild(emptyMessage);
        }

        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
            cartItemByElement.set(cartItem, item);

            const itemInfo = document.createElement("div");
            itemInfo.className = "cart-item-info";

            const itemName = document.createElement("strong");
            itemName.textContent = item.name;

            const itemPrice = document.createElement("span");
            itemPrice.textContent = `${item.price.toLocaleString("ru-RU")} ₴ за штуку`;

            itemInfo.append(itemName, itemPrice);

            const quantityControls = document.createElement("div");
            quantityControls.className = "cart-quantity";

            const minusButton = document.createElement("button");
            minusButton.type = "button";
            minusButton.dataset.action = "minus";
            minusButton.setAttribute("aria-label", `Уменьшить количество товара: ${item.name}`);
            minusButton.textContent = "−";

            const quantity = document.createElement("span");
            quantity.className = "quantity-number";
            quantity.textContent = item.quantity;

            const plusButton = document.createElement("button");
            plusButton.type = "button";
            plusButton.dataset.action = "plus";
            plusButton.setAttribute("aria-label", `Увеличить количество товара: ${item.name}`);
            plusButton.textContent = "+";

            quantityControls.append(minusButton, quantity, plusButton);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-item";
            removeButton.dataset.action = "remove";
            removeButton.setAttribute("aria-label", `Удалить товар из корзины: ${item.name}`);
            removeButton.textContent = "✕";

            cartItem.append(itemInfo, quantityControls, removeButton);

            cartItems.appendChild(cartItem);
        });

        if (focusedCartButton) {
            const updatedItemElement = Array.from(cartItems.querySelectorAll(".cart-item"))
                .find(element => cartItemByElement.get(element) === focusedItem);
            const updatedButton = updatedItemElement
                && updatedItemElement.querySelector(`button[data-action="${focusedAction}"]`);

            (updatedButton || cartClose).focus();
        }

        cartCount.textContent = count;
        cartCount.classList.remove("pulse");
void cartCount.offsetWidth;
cartCount.classList.add("pulse");
        cartTotal.textContent = total.toLocaleString("ru-RU") + " ₴";
    }

cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const itemElement = button.closest(".cart-item");
    const item = itemElement && cartItemByElement.get(itemElement);
    const action = button.dataset.action;

    if (!item || !cart.includes(item) || pendingRemovals.has(item)) return;

    if (action === "plus") {
        item.quantity++;
        updateCart();
    }

    if (action === "minus") {
        item.quantity--;

        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem !== item);
        }

        updateCart();
    }

    if (action === "remove") {
        pendingRemovals.add(item);
        itemElement.classList.add("is-removing");

        setTimeout(() => {
            cart = cart.filter(cartItem => cartItem !== item);
            updateCart();
        }, 350);
    }
});
    
    // ПОЯВЛЕНИЕ КАРТОЧЕК ПРИ ПРОКРУТКЕ

const productCards = document.querySelectorAll(".product-card");

if (typeof IntersectionObserver === "function") {
    productCards.forEach((card, index) => {
        card.classList.add("reveal-ready");
        card.style.transitionDelay = `${index * 150}ms`;
    });

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    productCards.forEach((card) => {
        cardObserver.observe(card);
    });
}

    // Загружаем сохранённую корзину при открытии сайта
updateCart();
