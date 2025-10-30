document.addEventListener('DOMContentLoaded', () => {
    getReservations();
    changeFilter();

})

function changeFilter() {
    document.querySelectorAll('.filterStatus input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const estado = radio.value;
            getReservations(estado);
            console.log(estado  );
        });
    });

    document.query
};


function getReservations(estado = 'todas') {
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/reservas.php?action=getReservations&estado=${estado}`, {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        //console.log(data);
        const reservasSection = document.querySelector('.reservas-container');
        if (!data.success || data.reservas.length === 0) {
            // Si no hay reservas, mostrar el contenido por defecto
            reservasSection.innerHTML = `
                <div class="reservas-default">
                    <div id="container-default-text">
                        <h1 id="default-title">Historial de Reservas</h1>
                        <p id="default-subtitle">Aquí podrás ver todas las reservas del negocio.</p>
                    </div>
                </div>
            `;
            return;
        }

        if (data.success) {
            let estado = '';
            reservasSection.innerHTML = '';
            data.reservas.forEach(reserva => {
                console.log(reserva);

                try {
                document.getElementById('totalReservations').textContent = data.total;
                document.getElementById('pendingReservations').textContent = data.totalPendientes;
                document.getElementById('confirmedReservations').textContent = data.totalConfirmadas;
                document.getElementById('canceledReservations').textContent = data.totalCanceladas;
                document.getElementById('finalizedReservations').textContent = data.totalFinalizadas;
                } catch (error) {
                    console.error('Error al actualizar los contadores de reservas:', error);
                }

                let buttons = '';

                switch (reserva.estado) {
                    case "Pendiente":
                        estado = `<span class="estadoPendiente">${reserva.estado}</span>`;
                        buttons = `
                            <button class="btnConfirmarReserva" onclick="confirmReservation(${reserva.id})">Confirmar</button>
                            <button class="btnCancelarReserva" onclick="cancelReservation(${reserva.id})">Cancelar</button>
                            `
                        break;
                    case "Confirmado":
                        estado = `<span class="estadoConfirmado">${reserva.estado}</span>`;
                        buttons = `
                            <button class="btnFinalizarReserva" onclick="finalizeReservation(${reserva.id})">Finalizar</button>
                            <button class="btnCancelarReserva" onclick="cancelReservation(${reserva.id})">Cancelar</button>
                            `
                        break;
                    case "Cancelado":
                        estado = `<span class="estadoCancelado">${reserva.estado}</span>`;
                        buttons = ``;
                        break;
                    case "Finalizado":
                        estado = `<span class="estadoFinalizado">${reserva.estado}</span>`;
                        buttons = ``;
                        break;
                    
                    default:
                        estado = `<span>${reserva.estado}</span>`;
                }
            
            const reservaDiv = document.createElement('div');
            reservaDiv.classList.add('reservaItem');
            reservaDiv.innerHTML += `
                <div class="reservaHeader">
                    <h3>${reserva.nombreCliente} #${reserva.id} ${estado}</h3>
                    <p>${reserva.codigoReserva}</p>
                </div>
                    <div class="reservaContent">
                        <div class="detailsReservation">
                            <span><i class="fa-regular fa-calendar"></i>Detalles de la reserva:</span>
                            <p><strong>Fecha:</strong> ${reserva.fechaReserva}</p>
                            <p><strong>Fecha de creación:</strong> ${reserva.fechaActual}</p>
                            <p><strong>Hora:</strong> ${reserva.hora}</p>
                            <p><strong>Número de personas:</strong> ${reserva.numeroPersonas}</p>
                            <p><strong>Número de mesa:</strong> ${reserva.id_mesa}</p>
                        </div>
                        <div class="detailsClient">
                            <span><i class="fa-regular fa-user"></i>Detalles de la personales:</span>
                            <p><strong>Nombre:</strong> ${reserva.nombreCliente}</p>
                            <p><strong>Teléfono:</strong> ${reserva.telefonoCliente}</p>
                            <p><strong>Email:</strong> ${reserva.emailCliente}</p>
                            <p><strong>Notas:</strong> ${reserva.notas || 'Ninguna'}</p>
                        </div>
                </div>
                <div class="reservaActions">
                    ${buttons}
                </div>
            `;
            
                reservasSection.appendChild(reservaDiv);
            });
        }    
    })
    .catch(err => console.error('Error al obtener reservas:', err));
}

function confirmReservation(id) {
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/reservas.php?action=confirmReservation`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("✅ Confirmada", "La reserva fue confirmada y la mesa está reservada.", "success");
            getReservations();
        } else {
            Swal.fire("⚠️ Error", data.message || "No se pudo confirmar.", "error");
        }
    });
}

function cancelReservation(id) {
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/reservas.php?action=cancelReservation`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("❌ Cancelada", "Reserva cancelada y mesa disponible.", "info");
            getReservations();
        } else {
            Swal.fire("⚠️ Error", data.message || "No se pudo cancelar.", "error");
        }
    });
}

function finalizeReservation(id) {
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/reservas.php?action=finalizeReservation`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("✅ Finalizada", "La reserva fue finalizada. Mesa disponible.", "success");
            getReservations();
        } else {
            Swal.fire("⚠️ Error", data.message || "No se pudo finalizar.", "error");
        }
    });
}
