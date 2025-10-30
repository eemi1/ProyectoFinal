
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

    document.getElementById('searchReservationsInput').addEventListener('input', (e) => {
        const filtro = e.target.value.toLowerCase();
        const reservas = document.querySelectorAll('.reservaItem');

        reservas.forEach(reserva => {
            const texto = reserva.textContent.toLowerCase();

            if (texto.includes(filtro)) {
                reserva.style.display = '';
            } else {
                reserva.style.display = 'none';
            }
        });
    });

    document.getElementById('filterDate').addEventListener('change', (e) => {
        const selectedDate = e.target.value; // siempre viene como YYYY-MM-DD
        const reservas = document.querySelectorAll('.reservaItem');

        reservas.forEach(reserva => {
            const fechaElemento = reserva.querySelector('.fechaReserva');
            if (!fechaElemento) return;

            const fechaReserva = fechaElemento.dataset.fecha; // usa el data-fecha original

            // Mostrar solo las que coincidan
            if (!selectedDate || fechaReserva === selectedDate) {
                reserva.style.display = '';
            } else {
                reserva.style.display = 'none';
            }
        });
    });

    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('searchReservationsInput').value = '';
        document.getElementById('filterDate').value = '';
        getReservations();
    });
}

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
                // 🔹 Formato automático DD/MM/YYYY
                const fechaReservaFormateada = new Date(reserva.fechaReserva).toLocaleDateString('es-ES');
                const fechaActualFormateada = new Date(reserva.fechaActual).toLocaleDateString('es-ES');

                try {
                    document.getElementById('totalReservations').textContent = data.total || 0;
                    document.getElementById('pendingReservations').textContent = data.pendingReservations || 0;
                    document.getElementById('confirmedReservations').textContent = data.confirmedReservations || 0;
                    document.getElementById('canceledReservations').textContent = data.canceledReservations || 0;
                    document.getElementById('finalizedReservations').textContent = data.finalizedReservations || 0;
                }catch(e){
                    console.error('Error al actualizar los contadores de reservas:', e);
                }

                let estado = '';
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
                            <button class="btnAsistioReserva" onclick="assistReservation(${reserva.id})">Asistió</button>
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

                    case "En curso":
                        estado = `<span class="estadoEnCurso">${reserva.estado}</span>`;
                        buttons = `
                        <button class="btnFinalizarReserva" onclick="finalizeReservation(${reserva.id})">Finalizar</button>
                        <button class="btnCancelarReserva" onclick="cancelReservation(${reserva.id})">Cancelar</button>
                        `;
                        break;
                    default:
                        estado = `<span>${reserva.estado}</span>`;
                }
            
            const reservaDiv = document.createElement('div');
            reservaDiv.classList.add('reservaItem');
            reservaDiv.dataset.id = reserva.id;
            reservaDiv.innerHTML += `
                <div class="reservaHeader">
                    <h3>${reserva.nombreCliente} #${reserva.id} ${estado}</h3>
                    <p>${reserva.codigoReserva}</p>
                </div>
                    <div class="reservaContent">
                        <div class="detailsReservation">
                            <span><i class="fa-regular fa-calendar"></i>Detalles de la reserva:</span>
                            <p class="fechaReserva" data-fecha="${reserva.fechaReserva}"><strong>Fecha de reserva:</strong> ${fechaReservaFormateada}</p>
                            <p><strong>Fecha de creación:</strong> ${fechaActualFormateada}</p>
                            <p><strong>Hora de reserva:</strong> ${reserva.hora}</p>
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
                const reservaDiv = document.querySelector(`.reservaItem[data-id="${id}"]`);
                if(reservaDiv){
                    reservaDiv.classList.add('removing');
                
                    reservaDiv.addEventListener('transitionend', () => {
                        getReservations();
                    }, { once: true });
                } else {
                    getReservations();
                }
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

function assistReservation(id) {
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/reservas.php?action=assistReservation`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire("✅ Asistió", "El cliente asistió a su reserva. Mesa ocupada.", "success");
            getReservations();
        } else {
            Swal.fire("⚠️ Error", data.message || "No se pudo marcar asistencia.", "error");
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

function showTablesAvailables() {

    const btnShowTables = document.getElementById('showTablesStatus');
    const searchFilter = document.querySelector('.reservasFilters');
    const statusFilter = document.querySelector('.filterStatus');

    if (!btnShowTables) {
        console.error('No se encontró el botón para mostrar mesas disponibles.');
        return;
    }

    btnShowTables.addEventListener('click', () => {

        fetch(`/proyectoFinal/app/Functions/dashboardAdmin/reservas.php?action=showTablesAvailables`, {
            method: "GET",
            credentials: "same-origin",
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                const reservasSection = document.querySelector('.reservas-container');
                reservasSection.innerHTML = '';

                try {
                    if (searchFilter.style.display === 'none' && statusFilter.style.display === 'none') {
                        searchFilter.style.display = 'flex';
                        statusFilter.style.display = 'flex';
                        getReservations();
                        btnShowTables.textContent = 'Ver Estado de Mesas';
                    } else {
                        searchFilter.style.display = 'none';
                        statusFilter.style.display = 'none';
                        btnShowTables.textContent = 'Ver Reservas';
                    }
                } catch (e) {
                    console.error('Error al ocultar filtros:', e);
                }

                const header = document.createElement('h3');
                header.textContent = 'Estado de Mesas';
                reservasSection.appendChild(header);

                const tablesContainer = document.createElement('div');
                tablesContainer.classList.add('tables-container');

                data.mesas.forEach(table => {
                    const tableDiv = document.createElement('div');
                    tableDiv.classList.add('tableItem');

                    switch (table.estado) {
                        case 'disponible':
                            tableDiv.classList.add('mesa-disponible');
                            break;
                        case 'ocupada':
                            tableDiv.classList.add('mesa-ocupada');
                            break;
                        case 'reservada':
                            tableDiv.classList.add('mesa-reservada');
                            break;
                        default:
                            tableDiv.classList.add('mesa-desconocida');
                            break;
                    }

                    tableDiv.innerHTML = `
                        <h3>Mesa #${table.id}</h3>
                        <p><strong>Capacidad:</strong> ${table.capacidad} personas</p>
                        <p><strong>Ubicación:</strong> ${table.ubicacion}</p>
                        <p><strong>Estado:</strong> ${table.estado}</p>
                    `;

                    tablesContainer.appendChild(tableDiv);

                });

                reservasSection.appendChild(tablesContainer);
            }
        })
        .catch(err => {
            console.error('Error al obtener mesas disponibles:', err);
        });
    });
}


