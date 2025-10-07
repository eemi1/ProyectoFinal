document.addEventListener("DOMContentLoaded", () => {
    loadHTMLComponent('header', '/proyectoFinal/app/View/Parts/navbar.html')
        .then(() => {
            // Se inicializan funciones del header SOLO después de cargarlo
            navLoggeado();
            menuProfile();
            cerrarSesion();
            viewCart();
            getCart();
            addProductsToCart();
            finalizarPedido();
        })
        .catch(err => console.error(err));

    loadHTMLComponent('footer', '/proyectoFinal/app/View/Parts/footer.html');
});

function loadHTMLComponent(selector, url) {
    return fetch(url)
        .then(response => response.text())
        .then(data => {
            document.querySelector(selector).innerHTML = data;
        })
        .catch(err => console.error(`Error cargando ${url}:`, err));
}

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

// Mostrar/Ocultar dropdown de perfil
function menuProfile() {
    const profile = document.getElementById('icon-profile-nav');
    const ddMenu = document.getElementById('dropdownMenu');
    if (!profile || !ddMenu) return;

    profile.addEventListener('click', () => {
        ddMenu.style.display = ddMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    // Cerrar dropdown al hacer click fuera
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

// Carrito lateral
function viewCart() {
    const btnCart = document.getElementById('btnCart'); 
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');

    if (!btnCart || !cartSidebar || !closeCart || !cartOverlay) return;

    btnCart.addEventListener('click', () => {
        cartSidebar.classList.add('open')
        cartOverlay.classList.add('open')

    });

    const closeFn = () => {
        cartSidebar.classList.remove('open')
        cartOverlay.classList.remove('open')

    };

    closeCart.addEventListener('click', closeFn);
    cartOverlay.addEventListener('click', closeFn);
}

function getCart() { //Se carga en main.js
    const cartCount = document.getElementById("cart-count");
    fetch("/proyectoFinal/app/Functions/products/indexProducts.php?action=getCart")
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            renderCart(data.cart); //Pasamos los datos a la funcion renderCart
            let totalProductos = 0;
            let totalPrecio = 0;
            let subTotal = 0;

            for (const id in data.cart) {
                const item = data.cart[id];
                const cantidad = item.cantidad ?? 0;
                const precio = item.precio ?? 0;
                const promocion = item.promocion ?? 'Sin Descuento';
                const valorPromocion = item.valorPromocion ?? 0;
                const tipoPromocion = item.tipoPromocion ?? 'none';


                if (tipoPromocion === '2x1'){
                    if (cantidad % 2 === 0){
                        subTotal = (cantidad / 2) * precio;
                    }else{
                        subTotal = ((cantidad - 1) / 2 + 1) * precio;
                    };
                }else if (tipoPromocion === 'porcentaje' && valorPromocion > 0){
                    subTotal = cantidad * precio * (1 - valorPromocion); 
                }else{
                    subTotal = cantidad * precio;
                }

                totalProductos += cantidad;
                totalPrecio += subTotal;

                console.log(`Producto ${id}: cantidad ${cantidad}: precio ${precio}`);
                console.log(`promocion: ${promocion}`);
            }
                // Actualizamos el contador del carrito al cargar la página
                cartCount.textContent = totalProductos;
                cartCount.style.display = totalProductos > 0 ? "inline" : "none";

        }
    })
    .catch(err => console.error("Error al obtener el carrito:", err));
}
function addProductsToCart() {
    const btnAddCart = document.querySelectorAll(".agregarCarrito");
    const cartCount = document.getElementById("cart-count");


    btnAddCart.forEach(btn => {
        btn.addEventListener("click", function() {
            let id = btn.getAttribute("data-id"); // le ponemos data-id al botón
            let precio = btn.getAttribute("data-precio")
            let promocion = btn.getAttribute("data-promocion");      // ej: "10%" o "2x1" o "Sin Descuento"
            let tipoPromocion = btn.getAttribute("data-tipo-promocion"); // "porcentaje", "2x1", "none"
            let valorPromocion = parseFloat(btn.getAttribute("data-valor-promocion")); // 0.1, 0, etc.

            fetch("/proyectoFinal/app/Functions/products/indexProducts.php?action=addCartTmp", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "same-origin",
                body: JSON.stringify({ id, precio, promocion, valorPromocion, tipoPromocion })

            })
            .then(result => result.json())
            .then(data => {
                console.log(data);
                if (data.success){
                let totalProductos = 0;
                for (const id in data.cart) {
                    const item = data.cart[id];
                
                    const cantidad = item.cantidad ?? item;
                    totalProductos += cantidad;
                }
                
                cartCount.textContent = totalProductos;
                cartCount.style.display = totalProductos > 0 ? "inline" : "none";
                renderCart(data.cart); 

                    Swal.fire({
                        title: '¡Agregado!',
                        text: data.message,
                        icon: 'success',
                        timer: 500,
                        showConfirmButton: false
                    });
                }else{
                    Swal.fire({
                        title: 'Error',
                        text: data.message,
                        icon: 'warning',
                        showConfirmButton: true,
                    })
                }
            });        
        })
    })
}
function renderCart(cartData) {
    const cartItemsContainer = document.querySelector(".cart-items"); // devuelve 1 elemento
    const cartTotalPrice = document.getElementById("cart-total");

    cartItemsContainer.innerHTML = ""; // limpiar contenido previo
    let totalPrecio = 0;
    let totalProductos = 0;

    if (cartData.length === 0){
        svgCart = `<svg xmlns="http://www.w3.org/2000/svg" class="icon-cart-empty" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                   </svg>`

        cartItemsContainer.innerHTML = `
        <div class="container-cart-empty">
        ${svgCart}
        <p class="cart-empty-title">No hay productos en el carrito</p>
        <p class="cart-empty">Agrega productos para comenzar tu pedido</p>
        </div>
        `;
        cartTotalPrice.textContent = "$ 0.00";
        return; // salir de la función
    }

    for (const id in cartData) {
        const item = cartData[id];

    console.log("Producto recibido:", item);
    console.log("ID:", id);
    console.log("Cantidad:", item.cantidad);
    console.log("Precio:", item.precio);
    console.log("Tipo de promoción:", item.tipoPromocion);
    console.log("Valor promoción:", item.valorPromocion);
    console.log("Promoción:", item.promocion);
        const cantidad = item.cantidad ?? 0;
        const precio = parseFloat(item.precio) ?? 0;
        const tipoPromocion = item.tipoPromocion ?? 'none';
        let valorPromocion = item.valorPromocion ?? 0;


        // Calcular subtotal según promoción
        let subTotal = 0;

        if (tipoPromocion === '2x1') {
            // Calcular subtotal
            if (cantidad % 2 === 0) {
                subTotal = (cantidad / 2) * precio;
            } else {
                subTotal = ((cantidad - 1) / 2 + 1) * precio;
            }
            item.promocion = '2x1';
        
        } else if (tipoPromocion === 'porcentaje' && valorPromocion > 0) {
            subTotal = cantidad * precio * (1 - valorPromocion);
            item.promocion = (valorPromocion * 100).toFixed(0) + '% OFF';
        
        } else {
            subTotal = cantidad * precio;
            item.promocion = 'Sin promoción';
        }

        
        totalProductos += cantidad;
        totalPrecio += subTotal;

        // Crear elemento HTML para este producto
        const productDiv = document.createElement("div");
        productDiv.className = "cart-item";
        productDiv.innerHTML = `
            <div class="cart-item-img-container">
                <img src="/proyectoFinal/uploads/${id}.jpg" alt="${item.nombre}" class="cart-item-img"
                     onerror="this.onerror=null;this.src='/proyectoFinal/uploads/imagen-default.png';">
                ${item.promocion && item.promocion !== 'Sin promoción' 
                    ? `<span class="cart-item-badge">${item.promocion}</span>` 
                    : ''}
            </div>
            <div class="cart-item-info">
                <p>${cantidad} x $${precio.toFixed(2)}</p>
                <p>Subtotal: $${subTotal.toFixed(2)}</p>
            </div>
            <button class="remove-from-cart" data-id="${id}">Eliminar</button>
        `;
        cartItemsContainer.appendChild(productDiv);
    }
    // toFixed : fuerza a que el return del decimal tenga 2 cifras máximo
    cartTotalPrice.textContent = `$ ${totalPrecio.toFixed(2)}`;
    // Añadir funcionalidad de eliminar
    document.querySelectorAll(".remove-from-cart").forEach(btn => {
        btn.addEventListener("click", function() {
            const id = btn.getAttribute("data-id");
            removeFromCart(id);
        });
    });
}
function removeFromCart(id) {
    fetch("/proyectoFinal/app/Functions/products/indexProducts.php?action=removeCartItem", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            getCart();
        } else {
            console.error(data.message);
        }
    });
}
function finalizarPedido() {
    const btnFinalizar = document.getElementById("checkout-btn");
    if (!btnFinalizar) return;

    btnFinalizar.addEventListener("click", () => {
        fetch("/proyectoFinal/app/Functions/products/indexProducts.php?action=getCart")
            .then(res => res.json())
            .then(data => {
                if (!data.success || !data.cart || Object.keys(data.cart).length === 0) {
                    Swal.fire("Carrito vacío", "Agrega productos antes de finalizar el pedido.", "warning");
                    return;
                }

                let productos = [];
                let total = 0;

                for (const id in data.cart) {
                    const item = data.cart[id];
                    const cantidad = item.cantidad ?? 0;
                    const precio = parseFloat(item.precio) ?? 0;
                    const tipoPromocion = item.tipoPromocion ?? 'none';
                    let valorPromocion = item.valorPromocion ?? 0;
                    let subTotal = 0;

                    if (tipoPromocion === '2x1') {
                        if (cantidad % 2 === 0) {
                            subTotal = (cantidad / 2) * precio;
                        } else {
                            subTotal = ((cantidad - 1) / 2 + 1) * precio;
                        }
                    } else if (tipoPromocion === 'porcentaje' && valorPromocion > 0) {
                        subTotal = cantidad * precio * (1 - valorPromocion);
                    } else {
                        subTotal = cantidad * precio;
                    }

                    total += subTotal;

                    // Agrega el producto al array para el backend
                    productos.push({
                        id_producto: id,
                        cantidad: cantidad,
                        precio: precio,
                        tipoPromocion: tipoPromocion,
                        valorPromocion: valorPromocion
                    });
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
                        // Vacía el carrito en el frontend
                        getCart(); // Vacía el carrito
                    } else {
                        Swal.fire("Error", result.message, "error");
                    }
                });
            });
    });
}