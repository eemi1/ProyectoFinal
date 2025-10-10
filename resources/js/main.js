// =====================
// INICIALIZACIÓN
// =====================
document.addEventListener("DOMContentLoaded", () => {
    // Cargar Header y Footer
    loadHTMLComponent('header', '/proyectoFinal/app/View/Parts/navbar.html')
        .then(() => {
            // Inicializar funciones del header solo después de cargarlo
            navLoggeado();
            menuProfile();
            cerrarSesion();
            viewCart();
            renderCartFromLocalStorage(); // Renderiza carrito desde localStorage
            addProductsToCart();
            finalizarPedido();
        })
        .catch(err => console.error(err));

    loadHTMLComponent('footer', '/proyectoFinal/app/View/Parts/footer.html');
});

// =====================
// CARGA DE COMPONENTES HTML
// =====================
function loadHTMLComponent(selector, url) {
    return fetch(url)
        .then(response => response.text())
        .then(data => {
            document.querySelector(selector).innerHTML = data;
        })
        .catch(err => console.error(`Error cargando ${url}:`, err));
}

// =====================
// GESTIÓN DE SESIÓN
// =====================
function navLoggeado() {
    fetch("/proyectoFinal/app/Functions/check.php?action=verificar")
        .then(res => res.json())
        .then(data => {
            const guestBtns = document.querySelector(".navbar-buttons");
            const loggedBtns = document.querySelector(".navbar-buttons-logged");
            if (!guestBtns || !loggedBtns) return;

            if (data.success) {
                guestBtns.style.display = "none";
                loggedBtns.style.display = "flex";

                const nameEl = document.getElementById("nameNavLogged");
                const emailEl = document.getElementById("emailNavLogged");
                if (nameEl) nameEl.textContent = data.usuario;
                if (emailEl) emailEl.textContent = data.email;
            } else {
                guestBtns.style.display = "flex";
                loggedBtns.style.display = "none";
            }
        })
        .catch(error => console.error("Error al verificar sesión:", error));
}

function menuProfile() {
    const profile = document.getElementById('icon-profile-nav');
    const ddMenu = document.getElementById('dropdownMenu');
    if (!profile || !ddMenu) return;

    profile.addEventListener('click', () => {
        ddMenu.style.display = ddMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    document.addEventListener('click', (e) => {
        if (!profile.contains(e.target) && !ddMenu.contains(e.target)) {
            ddMenu.style.display = 'none';
        }
    });
}

function cerrarSesion() {
    const btn_cerrarSesion = document.getElementById("logout");
    if (!btn_cerrarSesion) return;

    btn_cerrarSesion.addEventListener("click", () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cerrar sesión',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: "#d33",
            customClass: { popup: 'swal-custom-font' }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/proyectoFinal/app/Functions/check.php?action=cerrar", { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                title: '¡Nos vemos!',
                                text: 'Cerraste sesión correctamente.',
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 1500,
                                customClass: { popup: 'swal-custom-font' }
                            }).then(() => {
                                window.location.replace("/proyectoFinal/index.html");
                            });
                        }
                    });
            }
        });
    });
}

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
// AGREGAR PRODUCTOS AL CARRITO
// =====================
function addProductsToCart() {
    const btnAddCart = document.querySelectorAll(".agregarCarrito");
    const cartCount = document.getElementById("cart-count");

    btnAddCart.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const precio = parseFloat(btn.dataset.precio);
            const promocion = btn.dataset.promocion;
            const tipoPromocion = btn.dataset.tipoPromocion;
            const valorPromocion = parseFloat(btn.dataset.valorPromocion);

            let cart = getCartFromLocalStorage();

            if (cart[id]) cart[id].cantidad++;
            else cart[id] = { cantidad: 1, precio, promocion, tipoPromocion, valorPromocion };

            saveCartToLocalStorage(cart);

            // Actualizar contador
            const totalProductos = Object.values(cart).reduce((sum, item) => sum + item.cantidad, 0);
            if (cartCount) {
                cartCount.textContent = totalProductos;
                cartCount.style.display = totalProductos > 0 ? "inline" : "none";
            }

            Swal.fire({ 
                title: '¡Agregado!', 
                text: 'Producto agregado al carrito', 
                icon: 'success', 
                timer: 500, 
                showConfirmButton: false 
            });
        });
    });
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
                <img src="/proyectoFinal/uploads/${id}.jpg" alt="${item.nombre}" class="cart-item-img"
                     onerror="this.onerror=null;this.src='/proyectoFinal/uploads/imagen-default.png';">
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
        });
    });
}

// =====================
// FINALIZAR PEDIDO
// =====================
function finalizarPedido() {
    const btnFinalizar = document.getElementById("checkout-btn");
    if (!btnFinalizar) return;

    btnFinalizar.addEventListener("click", () => {
        const cart = getCartFromLocalStorage();

        if (!cart || Object.keys(cart).length === 0) {
            Swal.fire("Carrito vacío", "Agrega productos antes de finalizar el pedido.", "warning");
            return;
        }

        let productos = [];
        let total = 0;

        for (const id in cart) {
            const item = cart[id];
            const cantidad = item.cantidad ?? 0;
            const precio = parseFloat(item.precio) ?? 0;
            const tipoPromocion = item.tipoPromocion ?? 'none';
            const valorPromocion = item.valorPromocion ?? 0;

            let subTotal = 0;
            if (tipoPromocion === '2x1') subTotal = (Math.floor(cantidad/2) + cantidad%2) * precio;
            else if (tipoPromocion === 'porcentaje' && valorPromocion > 0) subTotal = cantidad * precio * (1 - valorPromocion);
            else subTotal = cantidad * precio;

            total += subTotal;

            productos.push({ id_producto: id, cantidad, precio, tipoPromocion, valorPromocion });
        }

        // Enviar pedido al backend
        fetch("/proyectoFinal/app/Functions/products/guardarPedido.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productos, total })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                Swal.fire("¡Pedido realizado!", "Tu pedido fue guardado correctamente.", "success");
                saveCartToLocalStorage({}); // vaciar carrito
            } else {
                Swal.fire("Error", result.message, "error");
            }
        });
    });
}

// =====================
// FUNCIONES AUXILIARES
// =====================
function getUserId() {
    return localStorage.getItem("id_usuario") || null;
}
