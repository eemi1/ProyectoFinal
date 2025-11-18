export function initEstadoPedidos() {
    cargarPedidos("todas");
    activarFiltros();
}

function activarFiltros() {
    document.querySelectorAll(".orderFilter").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".orderFilter").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            cargarPedidos(btn.dataset.state);
        });
    });
}

function cargarPedidos(estado) {
    fetch(`/app/Functions/dashboardMozo/getOrders.php?estado=${estado}`)
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                mostrarPedidos(data.data);
            } else {
                console.log(data.message);
                mostrarPedidos([]);
            }
        })
        .catch(err => {
            console.error("Error cargando pedidos:", err);
            mostrarPedidos([]);
        });
}

function mostrarPedidos(lista) {
    let tbody = document.getElementById("ordersList");
    tbody.innerHTML = "";

    // Actualizar contadores
    document.getElementById("countTodos").textContent = lista.length;
    document.getElementById("countPendiente").textContent = lista.filter(o => o.estado === "Pendiente").length;
    document.getElementById("countPreparando").textContent = lista.filter(o => o.estado === "Preparando").length;
    document.getElementById("countLista").textContent = lista.filter(o => o.estado === "Lista").length;
    document.getElementById("countEntregado").textContent = lista.filter(o => o.estado === "Entregado").length;

    if (lista.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6" style="text-align:center; padding:15px; color:#777;">
            No hay pedidos para mostrar.
        </td>`;
        tbody.appendChild(tr);
        return;
    }

    lista.forEach(order => {
        let tr = document.createElement("tr");

        if (order.estado === "Lista") {
            tr.classList.add("order-new");
        }

        const hora = order.fecha ? order.fecha.substring(11, 16) : "-";

        tr.innerHTML = `
            <td>#${order.id_factura}</td>
            <td>Mesa ${order.id_mesa ?? "?"}</td>
            <td>${hora}</td>
            <td><span class="estadoBadge estado-${order.estado}">${order.estado}</span></td>
            <td>$${Number(order.total).toFixed(2)}</td>
            <td><i class="fa-solid fa-eye iconVer" onclick="verDetallePedido(${order.id_factura})"></i></td>
        `;

        tbody.appendChild(tr);
    });
}

window.verDetallePedido = function(id) {

    fetch("/app/Functions/dashboardMozo/getOrderDetails.php?id=" + id)
        .then(res => res.json())
        .then(data => {

            if (!data.success) {
                Swal.fire("Error", data.message, "error");
                return;
            }

            let pedido = data.order;
            let productos = data.items;

            // Armamos un texto simple
            let texto = `
                Mesa: ${pedido.id_mesa}
                Estado: ${pedido.estado}
                Hora: ${pedido.fecha.substring(11, 16)}

                Productos:
            `;

            productos.forEach(p => {
                texto += `\n- ${p.nombre} x${p.cantidad} ($${p.precio})`;
            });

            texto += `

                Total: $${pedido.total}
            `;

            Swal.fire({
                title: "Pedido #" + id,
                icon: "info",
                html: `<pre style="text-align:left; font-size:14px; white-space:pre-wrap;">${texto}</pre>`
            });

        })
        .catch(err => {
            console.log(err);
            Swal.fire("Error", "No se pudo obtener el detalle", "error");
        });
};





setInterval(() => {
    let activeFilter = document.querySelector(".orderFilter.active");

    if (!activeFilter) return;

    let estado = activeFilter.dataset.state;
    cargarPedidos(estado);

}, 5000);