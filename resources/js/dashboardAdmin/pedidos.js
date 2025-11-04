
document.addEventListener('DOMContentLoaded', () => {
    changeFilterOrders();
})
/*=========================================*/
/*====== FILTROS RESERVAS Y MESAS =========*/
/*=========================================*/

function changeFilterOrders() {
    /*====== FILTROS PARA VER PEDIDOS =========*/
    document.querySelectorAll('.filterStatusOrders input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const estado = radio.value;
            getOrders(estado);
            console.log(estado);
        });
    });

    document.getElementById('searchOrdersInput').addEventListener('input', (e) => {
        const filtro = e.target.value.toLowerCase();
        const pedidos = document.querySelectorAll('.orderItem');

        pedidos.forEach(pedido => {
            const texto = pedido.textContent.toLowerCase();

            if (texto.includes(filtro)) {
                pedido.style.display = '';
            } else {
                pedido.style.display = 'none';
            }
        });
    });

    document.getElementById('clearFiltersOrders').addEventListener('click', () => {
        document.getElementById('searchReservationsInput').value = '';
        getOrders();
    });
}
/*===================================*/
/*===== VER RESERVAS PENDIENTES =====*/
/*===================================*/

function getOrders(estado = 'todas') {
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/pedidos.php?action=getOrders&estado=${estado}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const containerPedidos = document.getElementById('ordersContainer');
        if (!containerPedidos) return;
        containerPedidos.innerHTML = '';

        if (!data || data.length === 0) {
            containerPedidos.innerHTML = '<p class="noOrdersMessage">No hay pedidos que mostrar.</p>';
            return;
        }
        

        data.data.forEach(pedido => {

        let estado = '';
        let buttons = '';
        switch (pedido.estado) {
            case "Pendiente":
                estado = `<span class="estadoPendiente">${pedido.estado}</span>`;
                buttons = `
                    <button class="btnConfirmarOrder" onclick="confirmOrder(${pedido.id})">Confirmar</button>
                    <button class="btnCancelarOrder" onclick="cancelOrder(${pedido.id})">Cancelar</button>
                    `
                break;
            case "Preparando":
                estado = `<span class="estadoPreparacion">${pedido.estado}</span>`;
                buttons = `
                    <button class="btnListaOrder" onclick="listOrder(${pedido.id})">Orden Lista</button>
                    <button class="btnCancelarOrder" onclick="cancelReservation(${pedido.id})">Cancelar</button>
                    `
                break;
            case "Cancelado":
                estado = `<span class="estadoCancelado">${pedido.estado}</span>`;
                buttons = ``;
                break;
            case "Entregado":
                estado = `<span class="estadoEntregado">${pedido.estado}</span>`;
                buttons = ``;
                break
            default:
                estado = `<span>${pedido.estado}</span>`;
        }
        // Calcular total
        let total = 0;
        pedido.detalles.forEach(detalle => {
            total += parseFloat(detalle.subtotal);
        });

            const orderDiv = document.createElement('div');
            orderDiv.classList.add('orderItem');
            orderDiv.dataset.id = pedido.id;
            orderDiv.innerHTML = `
                <div class="orderContent">
                    <div class="orderHeader">
                        <div class="orderTitle">
                            <h3>${pedido.nombreCliente} #${pedido.id}</h3>
                            <p>${pedido.codigo}</p>
                        </div>
                        ${estado}
                    </div>

                    <div class="orderDetails">
                        <span>Artículos:</span>
                        <div class="articulosContainer"></div>
                    </div>

                    <div class="orderBtns">${buttons}</div>
                </div>

                
            `;

            const articulosContainer = orderDiv.querySelector('.articulosContainer');
            if (!articulosContainer) return;

            pedido.detalles.forEach(detalle => {
                const articulo = document.createElement('div');
                articulo.classList.add('articuloItem');

                articulo.innerHTML = `
                    <p>${detalle.cantidad}x ${detalle.nombre_producto}</p>
                `;

                articulosContainer.appendChild(articulo);
            });

            // Mostrar Total
            const totalOrder = document.createElement('p');
            totalOrder.classList.add('orderTotal');
            totalOrder.innerHTML = `
            <hr>
            <strong class="totalOrder">Total: $${total.toFixed(2)}</strong>`;
            articulosContainer.appendChild(totalOrder);

            containerPedidos.appendChild(orderDiv);
        });
    })
    .catch(error => console.error('Error fetching orders:', error));
}

function confirmOrder(id){
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/pedidos.php?action=confirmOrder`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("✅ Confirmado", "El pedido fue confirmado.", "success");
                const orderDiv = document.querySelector(`.orderItem[data-id="${id}"]`);
if (orderDiv) {
    orderDiv.classList.add('removing');
    orderDiv.addEventListener('transitionend', () => {
        getOrders();
    }, { once: true });
} else {
    getOrders();
}
        } else {
            Swal.fire("⚠️ Error", data.message || "No se pudo confirmar.", "error");
        }
    });

}

function cancelOrder(id){
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/pedidos.php?action=cancelOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("❌ Cancelado", "El pedido fue cancelado.", "success");
            getOrders();
        } else {
            Swal.fire("⚠️ Error", data.message || "No se pudo cancelar.", "error");
        }
    })
    .catch(err => console.error("Error:", err));
}

function listOrder(id){
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/pedidos.php?action=listOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("✅ Entregado", "El pedido fue marcado como entregado.", "success");
            getOrders();
        } else {
            Swal.fire("⚠️ Error", data.message || "No se pudo marcar como entregado.", "error");
        }
    })
    .catch(err => console.error("Error:", err));
}