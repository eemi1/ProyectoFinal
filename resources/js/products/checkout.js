    
document.addEventListener("DOMContentLoaded", () => {
    eventButton();
    loadProducts();
    finalizarPedido();
    deliveryMethod();

})

function deliveryMethod() {
    const inputs = document.querySelectorAll('input[name="deliveryMethod"]');
    
        inputs.forEach(input => {
            input.addEventListener("change", function() {
                const valorInput = input.value;
                if (valorInput === "envio") {
                    loadAddresses();
                }else if (valorInput === "retiro") {
                    document.querySelector('.Address').style.display = "none";
                }
            });
        })
}
    
function loadAddresses() {
    const address = document.querySelector('.Address')
    address.style.display = "block";
    const addressesContainer = document.getElementById("contentAddress");
        fetch("/app/Functions/dashboardUser/addressController.php?action=get", {
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            addressesContainer.innerHTML = "";

            if(data.success) {
                
                data.direcciones.forEach(dir => {
                    let valorPredeterminado = "";
                    if (dir.activo === 1 || dir.activo === "1"){
                        valorPredeterminado = `<p class='valorPredeterminado activo'>Predeterminado</p>`;
                    }else{
                        valorPredeterminado = "";
                    }
                    const div = document.createElement("div");
                    div.classList.add("option");
                    div.innerHTML = `
                        <input type="radio" class="options" name="address" id="address${dir.id}" data-id="${dir.id}">
                            <label for="address${dir.id}" class="addressLabel" data-id="${dir.id}">
                                <h4>${dir.alias || "Sin alias"} ${valorPredeterminado}</h4>
                                <p>${dir.calle || "Sin calle"}, ${dir.numero || "Sin número"}, ${dir.ciudad || " Sin ciudad"}, ${dir.departamento || "Sin Departamento"}, ${dir.codigo_postal || "Sin código postal"} </p>
                                <p id="references">Referencias: ${dir.referencia || "Sin referencias"}</p>
                            </label>
                    `;
                    addressesContainer.appendChild(div);

                    // Manejo de cambios del input seleccionado
                    const radioInput = div.querySelector('input[type="radio"]');
                    const option = div;

                    radioInput.addEventListener("change", function() {

                        // Remover la clase selected de todos los input
                        const opciones = addressesContainer.querySelectorAll(".option");
                        opciones.forEach(opc => {
                            opc.classList.remove("selected");
                        })
                        
                        // Validaciones
                        if (!radioInput.checked){
                            option.classList.remove("selected");
                        }

                        if (radioInput.checked){
                            option.classList.add("selected");
                        }

                    })
                });
            }

    })
    .catch(error => console.error("Error al cargar direcciones:", error));
}

function eventButton() {
    const button = document.querySelector(".admDireciones");
    button.addEventListener("click", function(){ 
        Swal.fire({
            title: '¡El checkout será cancelado! ',
            text: 'Serás redirigido a la configuración de usuario y el checkout será cancelado?, ¿Deseas continuar?',
            icon: 'info',
            confirmButtonText: 'Aceptar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#d33'
        })
        .then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/app/View/dashboardUser/ClientProfile.html"
            }
        })
    })
}

function loadProducts() {
    
    const cartData = JSON.parse(localStorage.getItem("cart")) || {}; // ← agrega esto
    const cartItemsContainer = document.querySelector(".contentSummary");
    const cartTotalContainer = document.querySelector(".footerSummary");
    cartItemsContainer.innerHTML = "";

    let totalProductos = 0;
    let totalPrecio = 0;

    // 🔹 Verificar si el carrito está vacío
    if (Object.keys(cartData).length === 0) {
        const svgCart = `<svg xmlns="http://www.w3.org/2000/svg" class="icon-cart-empty" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16"> 
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/> 
        </svg>`;

        cartItemsContainer.innerHTML = `
            <div class="container-cart-empty" style="margin: 30px 0px;">
                ${svgCart}
                <p class="cart-empty-title">No hay productos en el carrito</p>
                <p class="cart-empty">Agrega productos para comenzar tu pedido</p>
            </div>
            <div class="total-summary">
                <div class="subtotal">
                    <span><p>Total de productos:</p> ${totalProductos}</span>
                    <span><p>Envío:</p> $80</span>
                </div>
                <hr>
            <div class="total">
                <p><strong>Total:</strong> $${totalPrecio.toFixed(2)}</p>
                </div>
            </div>
            
            `;
            
        
        return;
    }

    for (const id in cartData) {
        const item = cartData[id];
        console.log(item)
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
            <div class="cart-item-img-container" id="imageProductCheckout">
                <img src="/uploads/products/${id}.jpg" alt="${item.nombre}" class="cart-item-img"
                    onerror="this.onerror=null;this.src='/uploads/products/imagen-default.png';">
            </div>
            <div class="cart-item-info">
                <span>${item.nombre}</span>
                <p class="amoutProductCheckout">Cantidad: ${item.cantidad}</p>
                <p class="subtotalProductCheckout">$${subTotal.toFixed(2)}</p>
            </div>
            
        `;
        cartItemsContainer.appendChild(productDiv);
    }
    // PRECIOS
    const totalDiv = document.createElement("div");
    totalDiv.className = "cart-total";
    totalDiv.innerHTML = `
    
        <div class="total-summary">
            <div class="subtotal">
                <span><p>Total de productos:</p> ${totalProductos}</span>
                <span><p>Envío:</p> $80</span>
            </div>
            <hr>
            <div class="total">
                <p><strong>Total:</strong> $${totalPrecio.toFixed(2)}</p>
            </div>
        </div>
                        <div class="btnConfirm">
                    <button type="submit" class="confirmOrder boton-primario" id="submit">Confirmar Pedido</button>
                    <p>Al confirmar aceptas nuestros términos y condiciones</p>
                </div>
        
    `;
    cartTotalContainer.appendChild(totalDiv);

}

function finalizarPedido() {
    const btnFinalizar = document.getElementById("submit");
    if (!btnFinalizar) return;

    btnFinalizar.addEventListener("click", (e) => {
        e.preventDefault();

        // Verificaciones
        const cart = getCartFromLocalStorage();
        if (!cart || Object.keys(cart).length === 0) {
            Swal.fire("Carrito vacío", "Agrega productos antes de finalizar el pedido.", "warning");
            return;
        }
        const metodoEntrega = document.querySelector('input[name="deliveryMethod"]:checked')?.value;
        let direccionSeleccionada = document.querySelector('input[name="address"]:checked');


        if (metodoEntrega === 'envio'){
            if (!direccionSeleccionada) {
                Swal.fire("Falta la dirección", "Selecciona una dirección de entrega antes de continuar.", "warning");
                return;
            }
        }else if (metodoEntrega === 'retiro') {
            direccionSeleccionada = { dataset: { id: null } }; // No se necesita dirección para retiro
        }else{
            Swal.fire("Falta método de entrega", "Selecciona un método de entrega antes de finalizar el pedido.", "warning");
            return;
        }

        const metodoPagoSeleccionado = document.querySelector('input[name="paymentMethod"]:checked');
        if (!metodoPagoSeleccionado) {
            Swal.fire("Falta método de pago", "Selecciona un método de pago antes de finalizar el pedido.", "warning");
            return;
        }

        let productos = [];
        let total = 0;
        const idDireccion = direccionSeleccionada.dataset.id;
        const metodoPago = metodoPagoSeleccionado.value;
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
            productos.push({ id_producto: id, cantidad, precio, tipoPromocion, valorPromocion, subtotal: subTotal });
        }


        let estadoPago = '';
        if (metodoPago === 'tarjeta') {
            estadoPago = 'pagado';
            console.log('pagado');
        } else {
            estadoPago = 'pendiente';
            console.log('pedneiten')
        }

        // Enviar pedido al backend
        fetch("/app/Functions/products/guardarPedido.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ productos, total, id_direccion: idDireccion, metodoPago, estadoPago, metodoEntrega})
        })
        .then(res => res.json())
        .then(data => {
            console.log(data); // opcional: ver en consola
            if (data.success) {
                Swal.fire("¡Pedido realizado!", "Tu pedido fue guardado correctamente.", "success");
                saveCartToLocalStorage({}); // vaciar carrito
                renderCartFromLocalStorage(); // actualizar visualmente el carrito
                loadProducts();

            } else {
                Swal.fire("Error", data.message, "error");
            }
        })
        .catch(err => console.error("Error en fetch:", err));
    });
    
}