export function initTomarPedidos() {
    cargarProductos();
    activarExtrasPedido();
}

let pedido = [];
let subtotal = 0;
let mesaSeleccionada = null;
let descuento = 0; 
let propina = 0;  


// ==========================
// Cargar productos del PHP
// ==========================
function cargarProductos() {
    fetch("/app/Functions/dashboardMozo/getProducts.php")
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            mostrarProductos(data.data);
        }
    })
    .catch(err => console.log("Error:", err));
}

// ==========================
// Mostrar productos
// ==========================
function mostrarProductos(lista) {
    let cont = document.getElementById("listaProductosMozo");
    cont.innerHTML = "";

    lista.forEach(p => {
        let div = document.createElement("div");
        div.className = "productoCard";

        div.innerHTML = `
            <div>
                <div class="productoNombre">${p.nombre}</div>
                <div class="productoCategoria">${p.categoria}</div>
            </div>

            <div>
                <div class="productoPrecio">$${Number(p.precio).toFixed(2)}</div>
                <button class="btnAdd" onclick="agregarAlPedido(${p.id}, '${p.nombre}', ${p.precio})">+</button>
            </div>
        `;

        cont.appendChild(div);
    });
}

// ==========================
// AGREGAR AL PEDIDO
// ==========================
window.agregarAlPedido = function(id, nombre, precio) {
    pedido.push({ id:id, nombre:nombre, precio:precio });
    subtotal += precio;
    actualizarPedido();
};

// ==========================
// ELIMINAR ITEM
// ==========================
window.eliminarItem = function(i) {
    subtotal -= pedido[i].precio;
    pedido.splice(i, 1);
    actualizarPedido();
};

// ==========================
// ACTUALIZAR TOTAL
// ==========================
function actualizarPedido() {

    let cont = document.getElementById("itemsPedido");
    let vacio = document.getElementById("pedidoVacio");

    cont.innerHTML = "";

    if (pedido.length === 0) {
        vacio.style.display = "block";
        document.getElementById("subtotalPedido").innerText = "$0";
        document.getElementById("totalPedido").innerText = "$0";
        return;
    }

    vacio.style.display = "none";

    pedido.forEach((item, i) => {
        let div = document.createElement("div");
        div.className = "itemPedido";

        div.innerHTML = `
            <span>${item.nombre}</span>
            <span>$${item.precio}</span>
            <button class="btnRemove" onclick="eliminarItem(${i})">x</button>
        `;

        cont.appendChild(div);
    });

    // ==========================
    // CÁLCULOS
    // ==========================

    let montoDescuento = subtotal * (descuento / 100);
    let total = subtotal - montoDescuento + propina;

    document.getElementById("subtotalPedido").innerText = "$" + subtotal.toFixed(2);
    document.getElementById("totalPedido").innerText = "$" + total.toFixed(2);
}

// ==========================
// CAPTURAR CAMBIOS DESCUENTO Y PROPINA
// ==========================
function activarExtrasPedido() {

    const descInput = document.getElementById("descuentoInput");
    const propInput = document.getElementById("propinaInput");

    if (descInput) {
        descInput.addEventListener("input", () => {
            descuento = Number(descInput.value) || 0;
            actualizarPedido();
        });
    }

    if (propInput) {
        propInput.addEventListener("input", () => {
            propina = Number(propInput.value) || 0;
            actualizarPedido();
        });
    }
}

// ==========================
// LIMPIAR PEDIDO
// ==========================
window.limpiarPedido = function() {
    Swal.fire({
        title: "¿Limpiar todo el pedido?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, limpiar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33"
    }).then(res => {
        if (res.isConfirmed) {
            pedido = [];
            subtotal = 0;
            mesaSeleccionada = null;
            descuento = 0;
            propina = 0;

            document.getElementById("descuentoInput").value = 0;
            document.getElementById("propinaInput").value = 0;

            actualizarPedido();
        }
    });
};

// ==========================
// SELECCIONAR MESA
// ==========================
window.seleccionarMesa = function() {
    Swal.fire({
        title: "Asignar Mesa",
        input: "number",
        inputLabel: "Número de Mesa",
        inputPlaceholder: "Ej: 4",
        confirmButtonText: "Asignar",
        showCancelButton: true
    }).then(res => {
        if (res.value) {
            mesaSeleccionada = res.value;
            document.getElementById("mesaSeleccionadaLabel").innerText = res.value;
        }
    });
};

// ==========================
// DIVIDIR CUENTA
// ==========================
window.dividirCuenta = function() {

    if (subtotal === 0) {
        Swal.fire("No hay nada que dividir.", "", "info");
        return;
    }

    Swal.fire({
        title: "¿Entre cuántas personas?",
        input: "number",
        inputPlaceholder: "Ej: 2",
        confirmButtonText: "Calcular",
        showCancelButton: true
    }).then(res => {

        if (res.value) {
            let personas = Number(res.value);
            let porPersona = subtotal / personas;

            Swal.fire({
                title: "Resultado",
                html: `
                    <p>Total: <b>$${subtotal}</b></p>
                    <p>Personas: <b>${personas}</b></p>
                    <p><b>$${porPersona.toFixed(2)} por persona</b></p>
                `,
                icon: "info"
            });
        }
    });
};

// ==========================
// ENVIAR PEDIDO
// ==========================
window.enviarPedido = function() {

    if (!mesaSeleccionada) {
        Swal.fire("Mesa requerida", "Debes seleccionar una mesa.", "error");
        return;
    }

    if (pedido.length === 0) {
        Swal.fire("Pedido vacío", "Agrega productos antes de enviar.", "error");
        return;
    }

    // Calcular total final
    let montoDescuento = subtotal * (descuento / 100);
    let totalFinal = subtotal - montoDescuento + propina;

    let datos = {
        mesa: mesaSeleccionada,
        subtotal: subtotal,
        descuento: descuento,
        propina: propina,
        total: totalFinal,
        items: pedido
    };

    fetch("/app/Functions/dashboardMozo/sentOrder.php", {
        method: "POST",
        body: JSON.stringify(datos)
    })
    .then(r => r.json())
    .then(data => {

        if (data.success) {
            Swal.fire({
                title: "Pedido creado",
                html: `
                    Código: <b>${data.codigo}</b><br>
                    Factura ID: <b>${data.id_factura}</b>
                `,
                icon: "success"
            });

            // Reset
            pedido = [];
            subtotal = 0;
            mesaSeleccionada = null;
            descuento = 0;
            propina = 0;

            document.getElementById("descuentoInput").value = 0;
            document.getElementById("propinaInput").value = 0;

            actualizarPedido();
        } else {
            Swal.fire("Error", data.message, "error");
        }
    });
};
