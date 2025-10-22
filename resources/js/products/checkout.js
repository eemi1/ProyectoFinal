    
document.addEventListener("DOMContentLoaded", () => {
    loadAddresses();
    eventButton();
    loadProducts();
    finalizarPedido();
})
    
function loadAddresses() {
    const addressesContainer = document.getElementById("contentAddress");
        fetch("/proyectoFinal/app/Functions/dashboardUser/addressController.php?action=get", {
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            addressesContainer.innerHTML = "";

            if(data.success) {
                
                data.direcciones.forEach(dir => {
                    if (dir.activo === 1 || dir.activo === "1"){
                        valorPredeterminado = `<p class='valorPredeterminado activo'>Predeterminado</p>`;
                    }else{
                        valorPredeterminado = "";
                    }
                    const div = document.createElement("div");
                    div.classList.add("option");
                    div.innerHTML = `
                        <input type="radio" name="address" id="address${dir.id}">
                            <label for="address${dir.id}" class="addressLabel" data-id="${dir.id}">
                                <h4>${dir.alias || "Sin alias"} ${valorPredeterminado}</h4>
                                <p>${dir.calle || "Sin calle"}, ${dir.numero || "Sin número"}, ${dir.ciudad || " Sin ciudad"}, ${dir.departamento || "Sin Departamento"}, ${dir.codigo_postal || "Sin código postal"} </p>
                                <p id=references">Referencias: ${dir.referencia || "Sin referencias"}</p>
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
                window.location.href = "/proyectoFinal/app/View/dashboardUser/ClientProfile.html"
            }
        })
    })
}

function loadProducts() {
    const cartData = JSON.parse(localStorage.getItem("cart")) || {}; // ← agrega esto
    const cartItemsContainer = document.querySelector(".contentSummary");
    cartItemsContainer.innerHTML = "";

    let totalProductos = 0;
    let totalPrecio = 0;

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
                <img src="/proyectoFinal/uploads/products/${id}.jpg" alt="${item.nombre}" class="cart-item-img"
                    onerror="this.onerror=null;this.src='/proyectoFinal/uploads/products/imagen-default.png';">
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
        
    `;
    cartItemsContainer.appendChild(totalDiv);
}

function finalizarPedido() {
    const btnFinalizar = document.getElementById("submit");
    if (!btnFinalizar) return;

    btnFinalizar.addEventListener("click", (e) => {
        e.preventDefault();
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
            credentials: "same-origin",
            body: JSON.stringify({ productos, total })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data); // opcional: ver en consola
            if (data.success) {
                Swal.fire("¡Pedido realizado!", "Tu pedido fue guardado correctamente.", "success");
                saveCartToLocalStorage({}); // vaciar carrito
                renderCartFromLocalStorage(); // actualizar visualmente el carrito
            } else {
                Swal.fire("Error", data.message, "error");
            }
        })
        .catch(err => console.error("Error en fetch:", err));
    });
    
}