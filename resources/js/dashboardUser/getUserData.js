function getOrders() {
    fetch("/proyectoFinal/app/Functions/dashboardUser/myProfile.php?action=getOrders", {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        const pedidosSection = document.getElementById('pedidos');

        if (!data.success || data.pedidos.length === 0) {
            // Si no hay pedidos, mostrar el contenido por defecto
            pedidosSection.innerHTML = `
                <div class="pedidos-default">
                    <div id="container-default-text">
                        <h1 id="default-title">Historial de Pedidos</h1>
                        <p id="default-subtitle">Aquí podrás ver todos tus pedidos anteriores.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Construir la lista de pedidos
        let html = '';
data.pedidos.forEach(pedido => {
    let estadoPedido = pedido.estado;
    let svgEstado = "";
    let estado = "";

    switch(estadoPedido) {
        case "pendiente":
            svgEstado = `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
            <path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 
            4.929-11 11-11zm0 11h6v1h-7v-9h1v8z"/>
            </svg>`;
            estado = `<span class="statusOrder pendiente">Pendiente</span>`;
            break;
        case "entregado":
            svgEstado = `<i class="fa-solid fa-check fa-lg"></i>`;
            estado = `<span class="statusOrder entregado">Entregado</span>`;
            break;
        case "cancelado":
            svgEstado = `<i class="fa-solid fa-exclamation fa-lg"></i>`;
            estado = `<span class="statusOrder cancelado">Cancelado</span>`;
            break;
        default:
            console.log("Error, no se ha encontrado el estado del pedido.");
            break;
    }

    let productosHTML = "";
    pedido.productos.forEach(prod => {
        productosHTML += `
            <div class="productoItem">
                <p>${prod.cantidad}x ${prod.nombre}</p>
                <p style="font-weight:bold;">$${prod.subtotal}</p>
            </div>
        `;
    });

    html += `
        <div class="pedidos">
            <div class="header">
                <div class="headerInfo">
                    <div class="productStatus">
                        ${svgEstado}
                    </div>
                    <div class="productInfo">
                        <span><strong>Pedido:</strong> #${pedido.codigo} ${estado}</span>
                        <p>📅 ${pedido.fechaFormateada}</p>
                        <p>📍 ${pedido.direccion.calle}, ${pedido.direccion.numero}, ${pedido.direccion.ciudad}</p>
                    </div>
                </div>
                <div class="headerPrice">
                    <span>$${pedido.total}</span>
                </div>
            </div>
            <hr>
            <div class="content">
                <span>ARTÍCULOS:</span>
                <div class="productosPedido">
                    ${productosHTML}
                </div>
            </div>
        </div>
    `;
});

        pedidosSection.innerHTML = html;
    })
    .catch(err => console.error('Error al obtener pedidos:', err));
}

function getReservations() {
    fetch("/proyectoFinal/app/Functions/dashboardUser/myProfile.php?action=getReservations", {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        const reservasSection = document.getElementById('reservas');
        if (!data.success || data.reservas.length === 0) {
            // Si no hay reservas, mostrar el contenido por defecto
            reservasSection.innerHTML = `
                <div class="reservas-default">
                    <div id="container-default-text">
                        <h1 id="default-title">Historial de Reservas</h1>
                        <p id="default-subtitle">Aquí podrás ver todas tus reservas anteriores.</p>
                    </div>
                </div>
            `;
            return;
        }

        if (data.success) {
            reservasSection.innerHTML = '';
            data.reservas.forEach(reserva => {
                const reservaDiv = document.createElement('div');
                reservaDiv.classList.add('reservaItem');
                reservaDiv.innerHTML = `
                    <div class="reservaHeader">
                        <h3>Reserva #${reserva.codigoReserva}</h3>
                        <p>📅 ${reserva.fechaFormateada}</p>
                    </div>
                    <div class="reservaDetails">
                        <p><strong>Fecha de Reserva:</strong> ${reserva.fechaReserva}</p>
                        <p><strong>Número de Personas:</strong> ${reserva.numeroPersonas}</p>
                        <p><strong>Mesa:</strong> ${reserva.id_mesa}</p>
                        <p><strong>Estado:</strong> ${reserva.estado}</p>
                    </div>
                `;
                reservasSection.appendChild(reservaDiv);
            });
        }    })
    .catch(err => console.error('Error al obtener reservas:', err));
}