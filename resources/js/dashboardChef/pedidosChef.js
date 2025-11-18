/* ============================================================
    INICIO DEL DASHBOARD DEL CHEF
============================================================ */
export function initPedidosChef() {
    console.log("👨‍🍳 initPedidosChef ejecutado");

    getOrdersChef();
    activarFiltrosChef();

    // Auto-refresh cada 7 segundos
    setInterval(() => getOrdersChef(), 7000);
}

/* ============================================================
    FILTROS
============================================================ */
function activarFiltrosChef() {

    document.querySelectorAll(".filterStatusOrders input[type='radio']")
        .forEach(radio => {
            radio.addEventListener("change", () => {
                getOrdersChef(radio.value);
            });
        });

    const input = document.getElementById("searchOrdersInput");
    input.addEventListener("input", e => {
        const texto = e.target.value.toLowerCase();
        document.querySelectorAll(".orderItem").forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(texto) ? "" : "none";
        });
    });

    document.getElementById("clearFiltersOrders").addEventListener("click", () => {
        input.value = "";
        getOrdersChef();
    });
}

/* ============================================================
    OBTENER PEDIDOS
============================================================ */
export function getOrdersChef(estado = "todas") {

    fetch(`/app/Functions/dashboardChef/pedidosChef.php?action=getOrders&estado=${estado}`)
        .then(r => r.json())
        .then(data => {

            const container = document.getElementById("ordersContainer");
            container.innerHTML = "";

            if (!data.success || data.data.length === 0) {
                container.innerHTML = `<p class="noOrdersMessage">No hay pedidos que mostrar.</p>`;
                return;
            }

            // actualizar estadísticas
            document.getElementById("totalOrders").textContent = data.totalOrders;
            document.getElementById("totalPending").textContent = data.totalPending;
            document.getElementById("totalPreparing").textContent = data.totalPreparing;
            document.getElementById("totalList").textContent = data.totalList;
            document.getElementById("totalSent").textContent = data.totalSent;

            data.data.forEach(pedido => {
                container.appendChild(crearPedidoHTML(pedido));
            });

        })
        .catch(err => console.error("❌ Error cargando pedidos:", err));
}

/* ============================================================
    CREAR TARJETA HTML
============================================================ */
function crearPedidoHTML(pedido) {

    const div = document.createElement("div");
    div.classList.add("orderItem");

    const articulosHTML = pedido.detalles
        .map(d => `<div class="articuloItem">${d.cantidad}x ${d.nombre_producto}</div>`)
        .join("");

    let estadoHTML = "";
    let botones = "";

    switch (pedido.estado) {
        case "Pendiente":
            estadoHTML = `<span class="estadoPendiente">${pedido.estado}</span>`;
            botones = `<button onclick="prepararChef(${pedido.id_factura})" class="btnPreparandoOrder">Preparar</button>`;
            break;

        case "Preparando":
            estadoHTML = `<span class="estadoPreparacion">${pedido.estado}</span>`;
            botones = `<button onclick="marcarListoChef(${pedido.id_factura})" class="btnListaOrder">Listo</button>`;
            break;

        case "Lista":
            estadoHTML = `<span class="estadoLista">${pedido.estado}</span>`;
            botones = `<button onclick="entregarChef(${pedido.id_factura})" class="btnEntregadoOrder">Entregar</button>`;
            break;

        case "Entregado":
            estadoHTML = `<span class="estadoEntregado">${pedido.estado}</span>`;
            break;

        case "Cancelado":
            estadoHTML = `<span class="estadoCancelado">${pedido.estado}</span>`;
            break;
    }

    div.innerHTML = `
        <div class="orderContent">

            <div class="orderHeader">
                <div class="orderTitle">
                    <h3>Pedido #${pedido.id_factura}</h3>
                    <p>${pedido.codigo}</p>
                </div>
                <div class="orderStatus">
                    ${estadoHTML}
                </div>
            </div>

            <div class="orderDetails">
                <span>Artículos:</span>
                <div class="articulosContainer">${articulosHTML}</div>
            </div>

            <div class="orderBtns">${botones}</div>

        </div>
    `;

    return div;
}

/* ============================================================
    ACCIONES
============================================================ */
window.prepararChef = id =>
    actualizarEstadoChef(id, "preparingOrder", "El pedido pasó a PREPARACIÓN");

window.marcarListoChef = id =>
    actualizarEstadoChef(id, "listOrder", "El pedido ahora está LISTO");

window.entregarChef = id =>
    actualizarEstadoChef(id, "sentOrder", "Pedido ENTREGADO correctamente");

window.cancelOrderChef = id =>
    actualizarEstadoChef(id, "cancelOrder", "Pedido CANCELADO");

/* ============================================================
    ACTUALIZAR ESTADO
============================================================ */
function actualizarEstadoChef(id_factura, accion, texto) {

    fetch(`/app/Functions/dashboardChef/pedidosChef.php?action=${accion}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_factura })
    })
        .then(r => r.json())
        .then(data => {

            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: "✔ Actualizado",
                    text: texto,
                    timer: 1300,
                    showConfirmButton: false
                });
                getOrdersChef();
            } else {
                Swal.fire("Error", data.message || "No se pudo actualizar", "error");
            }

        })
        .catch(err => {
            Swal.fire("Error", "Error inesperado", "error");
            console.error(err);
        });
}
