// pedidos.js
export function initPedidos() {
    console.log("✅ initPedidos ejecutado");
    getOrders();
    changeFilterOrders();
}


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
        document.getElementById('searchOrdersInput').value = '';
        getOrders();
    });
}
/*===================================*/
/*===== VER RESERVAS PENDIENTES =====*/
/*===================================*/

function getOrders(estado = 'todas') {
    fetch(`/app/Functions/dashboardAdmin/pedidos.php?action=getOrders&estado=${estado}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const containerPedidos = document.getElementById('ordersContainer');
        if (!containerPedidos) return;
        containerPedidos.innerHTML = '';

        if (!data || !data.data || data.data.length === 0) {
            containerPedidos.innerHTML = `<p class="noOrdersMessage">No hay pedidos que mostrar.</p>`;
            console.log("Sin pedidos activos");
            return;
        }

        try {
            document.getElementById('totalOrders').textContent = data.totalOrders || 0;
            document.getElementById('totalPending').textContent = data.totalPending || 0;
            document.getElementById('totalPreparing').textContent = data.totalPreparing || 0;
            document.getElementById('totalList').textContent = data.totalList || 0;
            document.getElementById('totalSent').textContent = data.totalSent || 0;
        }catch(e){
            console.error('Error al actualizar los contadores de reservas:', e);
        }
        

        data.data.forEach(pedido => {
            
        if (!pedido.detalles || pedido.detalles.length === 0) return;

        let estadoHTML = '';
        let buttons = '';
        switch (pedido.estado) {
            case "Pendiente":
                estadoHTML = `<span class="estadoPendiente">${pedido.estado}</span>`;
                buttons = `
                    <button class="btnPreparandoOrder" onclick="preparingOrder(${pedido.id})">Preparando</button>
                    <button class="btnCancelarOrder" onclick="cancelOrder(${pedido.id})">Cancelar</button>
                    `
                break;
            case "Preparando":
                estadoHTML = `<span class="estadoPreparacion">${pedido.estado}</span>`;
                buttons = `
                    <button class="btnListaOrder" onclick="listOrder(${pedido.id})">Orden Lista</button>
                    <button class="btnCancelarOrder" onclick="cancelOrder(${pedido.id})">Cancelar</button>
                    ${pedido.estadoPago !== 'pagado' ? `<button class="btnPagoOrder" onclick="markAsPaid(${pedido.id})">Marcar Pagado</button>` : ''}

                    `
                break;
            case 'Lista':
                estadoHTML = `<span class="estadoLista">${pedido.estado}`;
                buttons = `
                <button class="btnEntregadoOrder" onclick="sentOrder(${pedido.id})">Entregada</button>
                <button class="btnCancelarOrder" onclick="cancelOrder(${pedido.id})">Cancelar</button>
                ${pedido.estadoPago !== 'pagado' ? `<button class="btnPagoOrder" onclick="markAsPaid(${pedido.id})">Marcar Pagado</button>` : ''}

                `
                break;
            case "Entregado":
                    estadoHTML = `<span class="estadoEntregado">${pedido.estado}</span>`;
                    buttons = ``;
                    break

            case "Cancelado":
                estadoHTML = `<span class="estadoCancelado">${pedido.estado}</span>`;
                buttons = ``;
                break;

            default:
                estadoHTML = `<span>${pedido.estado}</span>`;
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
                        <div class="orderStatus">
                        ${estadoHTML}
                        <p><strong>Estado Pago:</strong> ${pedido.estadoPago || `Sin estado de pago`}   </p>                   
                        </div>
                        
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

                articulo.textContent = `${detalle.cantidad}x ${detalle.nombre_producto}`;

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


export function preparingOrder(id){
    fetch(`/app/Functions/dashboardAdmin/pedidos.php?action=preparingOrder`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("Confirmado", "El pedido fue confirmado.", "success");
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
            Swal.fire("Error", data.message || "No se pudo confirmar.", "error");
        }
    });

}

export function listOrder(id){
    fetch(`/app/Functions/dashboardAdmin/pedidos.php?action=listOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("Entregado", "El pedido fue marcado como entregado.", "success");
            getOrders();
        } else {
            Swal.fire("Error", data.message || "No se pudo marcar como entregado.", "error");
        }
    })
    .catch(err => console.error("Error:", err));
}

export function sentOrder(id){
    fetch('/app/Functions/dashboardAdmin/pedidos.php?action=sentOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire('Entregado', 'El pedido fue marcado como entregado.', 'success');
            getOrders();
        } else {
            Swal.fire('Error', data.message || 'No se pudo marcar como entregado.', 'error');
        }
    })
    .catch(err => console.error('Error:', err));

}
export function cancelOrder(id){
    fetch(`/app/Functions/dashboardAdmin/pedidos.php?action=cancelOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("Cancelado", "El pedido fue cancelado.", "success");
            getOrders();
        } else {
            Swal.fire("Error", data.message || "No se pudo cancelar.", "error");
        }
    })
    .catch(err => console.error("Error:", err));
}

export function markAsPaid(id) {
    fetch(`/app/Functions/dashboardAdmin/pedidos.php?action=markAsPaid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("Pago confirmado", data.message, "success");
            getOrders();
        } else {
            Swal.fire("Error", data.message || "No se pudo marcar como pagado.", "error");
        }
    })
    .catch(err => console.error("Error:", err));
}
