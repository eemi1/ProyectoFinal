// =====================
// CARRITO LATERAL
// =====================
function viewCart() {
    const btnCart = document.getElementById('btnCart'); 
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');

    if (!btnCart || !cartSidebar || !closeCart || !cartOverlay) return;

    const openCart = () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    };
    const closeCartFn = () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    };

    btnCart.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartFn);
    cartOverlay.addEventListener('click', closeCartFn);
}

// =====================
// LOCAL STORAGE DEL CARRITO
// =====================
function getCartFromLocalStorage() {
    return JSON.parse(localStorage.getItem("cart") || "{}");
}

function saveCartToLocalStorage(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartFromLocalStorage();
}


// =====================
// RENDERIZAR CARRITO
// =====================
function renderCartFromLocalStorage() {
    const cart = getCartFromLocalStorage();
    renderCart(cart);
}

function removeFromCart(id) {
    let cart = getCartFromLocalStorage();
    if (cart[id]) delete cart[id];
    saveCartToLocalStorage(cart);
}

function renderCart(cartData) {
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartTotalPrice = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");

    cartItemsContainer.innerHTML = "";
    let totalPrecio = 0;
    let totalProductos = 0;

    if (Object.keys(cartData).length === 0){
        const svgCart = `<svg xmlns="http://www.w3.org/2000/svg" class="icon-cart-empty" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16"> 
        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/> 
        </svg>`; // tu SVG
        cartItemsContainer.innerHTML = `
            <div class="container-cart-empty">
                ${svgCart}
                <p class="cart-empty-title">No hay productos en el carrito</p>
                <p class="cart-empty">Agrega productos para comenzar tu pedido</p>
            </div>`;
        if (cartTotalPrice) cartTotalPrice.textContent = "$ 0.00";
        if (cartCount) {
            cartCount.textContent = 0;
            cartCount.style.display = "none";
        }
        return;
    }

    for (const id in cartData) {
        const item = cartData[id];
        const cantidad = item.cantidad ?? 0;
        const precio = parseFloat(item.precio) ?? 0;
        const tipoPromocion = item.tipoPromocion ?? 'none';
        let valorPromocion = item.valorPromocion ?? 0;

        let subTotal = 0;
        if (tipoPromocion === '2x1') subTotal = (Math.floor(cantidad/2) + cantidad%2) * precio;
        else if (tipoPromocion === 'porcentaje' && valorPromocion > 0) subTotal = cantidad * precio * (1 - valorPromocion);
        else subTotal = cantidad * precio;

        totalProductos += cantidad;
        totalPrecio += subTotal;

        const productDiv = document.createElement("div");
        productDiv.className = "cart-item";
        productDiv.innerHTML = `
            <div class="cart-item-img-container">
                <img src="/uploads/products/${id}.jpg" alt="${item.nombre}" class="cart-item-img"
                    onerror="this.onerror=null;this.src='/uploads/products/imagen-default.png';">
                ${item.promocion && item.promocion !== 'Sin promoción' ? `<span class="cart-item-badge">${item.promocion}</span>` : ''}
            </div>
            <div class="cart-item-info">
                <p>${cantidad} x $${precio.toFixed(2)}</p>
                <p>Subtotal: $${subTotal.toFixed(2)}</p>
            </div>
            <button class="remove-from-cart" data-id="${id}">Eliminar</button>
        `;
        cartItemsContainer.appendChild(productDiv);
    }

    if (cartTotalPrice) cartTotalPrice.textContent = `$ ${totalPrecio.toFixed(2)}`;
    if (cartCount) {
        cartCount.textContent = totalProductos;
        cartCount.style.display = totalProductos > 0 ? "inline" : "none";
    }

    // Añadir evento para eliminar
    document.querySelectorAll(".remove-from-cart").forEach(btn => {
        btn.addEventListener("click", function() {
            removeFromCart(btn.dataset.id);
            loadProducts();
        });
    });
}

// =====================
// AGREGAR PRODUCTOS AL CARRITO
// =====================
function addProductsToCart() {
    const btnAddCart = document.querySelectorAll(".agregarCarrito");
    const cartCount = document.getElementById("cart-count");

    btnAddCart.forEach(btn => {
        btn.addEventListener("click", () => {
            fetch("/app/Functions/check.php?action=verificar")
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        Swal.fire({
                            title: "Inicia sesión",
                            text: "Debes iniciar sesión para agregar productos al carrito.",
                            icon: "warning",
                            confirmButtonText: "Iniciar sesión"
                        }).then(() => {
                            window.location.href = "/app/View/Auth/login.html";
                        });
                        return;
                    }
                    const nombre = btn.dataset.nombre;
                    const descripcion = btn.dataset.descripcion;
                    const id = btn.dataset.id;
                    const precio = parseFloat(btn.dataset.precio);
                    const promocion = btn.dataset.promocion;
                    const tipoPromocion = btn.dataset.tipoPromocion;
                    const valorPromocion = parseFloat(btn.dataset.valorPromocion);

                    let cart = getCartFromLocalStorage();

                    if (cart[id]) cart[id].cantidad++;
                    else cart[id] = { cantidad: 1,nombre, descripcion, precio, promocion, tipoPromocion, valorPromocion };

                    saveCartToLocalStorage(cart);

                    Swal.fire({
                        title: '¡Agregado!',
                        text: 'Producto agregado al carrito',
                        icon: 'success',
                        timer: 500,
                        showConfirmButton: false
                    });
                })
                .catch(error => console.error("Error al verificar sesión:", error));
        });
    });
}


// =====================
// FINALIZAR PEDIDO
// =====================
function checkout() {
    const btnFinalizar = document.getElementById("checkout-btn");
    if (!btnFinalizar) return;

    btnFinalizar.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/app/View/Products/checkout.html";
    });
    
}

// =====================
// FUNCIONES AUXILIARES
// =====================
function getUserId() {
    return localStorage.getItem("id_usuario") || null;
}
