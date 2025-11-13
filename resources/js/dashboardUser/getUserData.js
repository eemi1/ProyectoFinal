function getOrders() {
    fetch("/app/Functions/dashboardUser/myProfile.php?action=getOrders", {
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
    console.log(estadoPedido);
    let svgEstado = "";
    let estado = "";

    switch(estadoPedido) {
        case "Pendiente":
            svgEstado = `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
            <path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 
            4.929-11 11-11zm0 11h6v1h-7v-9h1v8z"/>
            </svg>`;
            estado = `<span class="statusOrder pendiente">Pendiente</span>`;
            break;
        case "Entregado":
            svgEstado = `<i class="fa-solid fa-check fa-lg"></i>`;
            estado = `<span class="statusOrder entregado">Entregado</span>`;
            break;
        case "Preparando":
            svgEstado = `<i class="fa-solid fa-check fa-lg"></i>`;
            estado = `<span class="statusOrder preparando">Preparando</span>`;
            break;
        case "Lista":
            svgEstado = `<i class="fa-solid fa-check fa-lg"></i>`;
            estado = `<span class="statusOrder lista">Lista</span>`;
            break;
        case "Cancelado":
            svgEstado = `<i class="fa-solid fa-exclamation fa-lg"></i>`;
            estado = `<span class="statusOrder cancelado">Cancelado</span>`;
            break;
        default:
            svgEstado = 'Error';
            estado = 'Error';
            console.log("Error, no se ha encontrado el estado del pedido.");
            break;
    }

    let direccionTexto = "";

    if (!pedido.direccion || (pedido.direccion.calle === null && pedido.direccion.numero === null && pedido.direccion.ciudad === null)) {
        direccionTexto = "Sin dirección registrada";
    } else {
        direccionTexto = `${pedido.direccion.calle}, ${pedido.direccion.numero}, ${pedido.direccion.ciudad}`;
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
                        <p>📍 ${direccionTexto}</p>
                        <p>🚚 Método de entrega: ${pedido.metodoEntrega}</p>
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
    fetch("/app/Functions/dashboardUser/myProfile.php?action=getReservations", {
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
            let estado = '';
            reservasSection.innerHTML = '';
            data.reservas.forEach(reserva => {
                let estado = '';
                switch (reserva.estado) {
                    case "Pendiente":
                        estado = `<span class="estadoPendiente">${reserva.estado}</span>`;
                        break;
                    case "Confirmado":
                        estado = `<span class="estadoConfirmado">${reserva.estado}</span>`;
                        break;
                    case "Cancelado":
                        estado = `<span class="estadoCancelado">${reserva.estado}</span>`;
                        break;
                    case "noAsistio":
                        estado = `<span class="estadoNoAsistio">No Asistió</span>`;
                        break;
                    default:
                        estado = `<span>${reserva.estado}</span>`;
                }
            
            // === Calcular diferencia de tiempo ===
            const horaReserva = new Date(`${reserva.fechaReserva}T${reserva.hora}`);
            const horaActual = new Date();
            const diferenciaHoras = (horaReserva - horaActual) / (1000 * 60 * 60);

            const puedeCancelar = diferenciaHoras > 2;

            // Texto botones
            let botonDeshabilitado;
            let textoBoton;
            let title;

            if (!puedeCancelar || reserva.estado === 'Cancelado') {
                botonDeshabilitado = 'disabled';
                textoBoton = 'Cancelación no disponible';
                title= "No puedes cancelar esta reserva, falta menos de 2 horas o ya está cancelada.";
            } else {
                botonDeshabilitado = '';
                textoBoton = 'Cancelar reserva';
                title= "Cancelar esta reserva.";
            }
            
            const reservaDiv = document.createElement('div');
            reservaDiv.classList.add('reservaItem');
            reservaDiv.innerHTML = `
                <div class="reservaHeader">
                    <div class="reservaHeaderTitle">
                        <h3><i class="fa-regular fa-calendar"></i><span>Reserva</span> #${reserva.codigoReserva}</h3>
                        <p>${reserva.fechaFormateada}</p>
                    </div>
                    <div class="reservaHeaderEstado">${estado}</div>
                </div>
                <div class="reservaDetails">
                    <p><strong><i class="fa-regular fa-clock"></i>Hora:</strong> ${reserva.hora}</p>
                    <p><strong><i class="fa-solid fa-phone"></i>Teléfono:</strong> ${reserva.telefonoCliente}</p>
                    <p><strong><i class="fa-regular fa-user"></i>Número de Personas:</strong> ${reserva.numeroPersonas}</p>
                    <p><strong><i class="fa-regular fa-envelope"></i>Email:</strong> ${reserva.emailCliente}</p>
                    <p><strong><i class="fa-solid fa-location-dot"></i>Número de mesa:</strong> ${reserva.id_mesa}</p>
                    <div>
                        <p><strong><i class="fa-regular fa-note-sticky"></i>Notas</strong></p>
                        <small>${reserva.notas || "Sin nota"}</small>
                    </div>
                </div>
                <div class="reservaButton">
                    <button class="btnCancelarReserva" 
                        data-codigo="${reserva.codigoReserva}" ${botonDeshabilitado} title="${title}">
                        ${textoBoton}
                    </button>
                </div>
            `;
            
                reservasSection.appendChild(reservaDiv);
            });
            cancelarReserva();
        }    
    })
    .catch(err => console.error('Error al obtener reservas:', err));
}

function cancelarReserva() {
    const btnCancelar = document.querySelectorAll('.btnCancelarReserva');
    btnCancelar.forEach(btn => {
        btn.addEventListener('click', (e) => {
            Swal.fire({
                title: '¿Estás seguro de cancelar esta reserva?',
                text: "Esta acción no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cancelar reserva',
                cancelButtonText: 'No, mantener reserva'
            }).then((result) => {
                if (result.isConfirmed) {
                    const codigoReserva = e.target.dataset.codigo;
                    // console.log(`Cancelar reserva: ${codigoReserva}`);
                    fetch(`/app/Functions/dashboardUser/myProfile.php?action=cancelReservation`, {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ codigoReserva: codigoReserva })
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                        if (data.success) { 
                            Swal.fire({
                                icon: 'success',
                                title: 'Reserva cancelada',
                                text: 'La reserva ha sido cancelada exitosamente.'
                            });
                            getReservations()
                        } else {
                            console.error('Error al cancelar la reserva:', data.message);
                        }
                    })
                    .catch(err => console.error('Error al cancelar la reserva:', err));
                }
            });
        });
    });
}