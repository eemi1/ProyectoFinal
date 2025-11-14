// reservations.js
export function initReservas() {
    console.log("📅 initReservas ejecutado");
        changeFilterReservations();
        showTablesAvailables();
        getReservations(); // cargar por defecto
}

/*=========================================*/
/*====== FILTROS RESERVAS Y MESAS =========*/
/*=========================================*/

function changeFilterReservations() {
    try{
        /*====== FILTROS PARA VER RESERVAS =========*/
        document.querySelectorAll('.filterStatusReservations input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const estado = radio.value;
                getReservations(estado);
                console.log(estado);
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
            const selectedDate = e.target.value; // YYYY-MM-DD
            const reservas = document.querySelectorAll('.reservaItem');
            console.log(`selectedDate: ${selectedDate}`);
            console.log(`reservas: ${reservas}`);
        
            reservas.forEach(reserva => {
                const fechaElemento = reserva.querySelector('.fechaReserva');
                if (!fechaElemento) return;
            
                const fechaReserva = fechaElemento.dataset.fecha;
                // console.log(`fechaReserva: ${fechaReserva}`);

                // Mostrar solo las que coincidan
                if (!selectedDate || fechaReserva === selectedDate) {
                    reserva.style.display = '';
                } else {
                    reserva.style.display = 'none';
                }
            });
        });
    
        document.getElementById('clearFiltersReservations').addEventListener('click', () => {
            document.getElementById('searchReservationsInput').value = '';
            document.getElementById('filterDate').value = '';
            getReservations();
        });

    }catch(e){
        console.error("Error en changeFilter:", e);
    }
}




/*===================================*/
/*===== VER RESERVAS PENDIENTES =====*/
/*===================================*/

function getReservations(estado = 'todas') {
    fetch(`/app/Functions/dashboardAdmin/reservas.php?action=getReservations&estado=${estado}`, {
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
                        <p id="default-subtitle">No se encuentran reservas con este filtro.</p>
                    </div>
                </div>
            `;
            return;
        }

        if (data.success) {
            let estado = '';
            
            reservasSection.replaceChildren(); // más seguro que innerHTML = ''
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

                let estadoHTML = '';
                let buttons = '';
                switch (reserva.estado) {
                    case "Pendiente":
                        estadoHTML = `<span class="estadoPendiente">${reserva.estado}</span>`;
                        buttons = `
                            <button class="btnConfirmarReserva" onclick="confirmReservation(${reserva.id})">Confirmar</button>
                            <button class="btnCancelarReserva" onclick="cancelReservation(${reserva.id})">Cancelar</button>
                            `
                        break;
                    case "Confirmado":
                        estadoHTML = `<span class="estadoConfirmado">${reserva.estado}</span>`;
                        buttons = `
                            <button class="btnAsistioReserva" onclick="assistReservation(${reserva.id})">Asistió</button>
                            <button class="btnCancelarReserva" onclick="cancelReservation(${reserva.id})">Cancelar</button>
                            `
                        break;
                    case "Cancelado":
                        estadoHTML = `<span class="estadoCancelado">${reserva.estado}</span>`;
                        buttons = ``;
                        break;
                    case "Finalizado":
                        estadoHTML = `<span class="estadoFinalizado">${reserva.estado}</span>`;
                        buttons = ``;
                        break;
                    case "En curso":
                        estadoHTML = `<span class="estadoEnCurso">${reserva.estado}</span>`;
                        buttons = `
                        <button class="btnFinalizarReserva" onclick="finalizeReservation(${reserva.id})">Finalizar</button>
                        <button class="btnCancelarReserva" onclick="cancelReservation(${reserva.id})">Cancelar</button>
                        `;
                        break;
                    case "no_show":
                        estadoHTML = `<span class="estadoNoShow">${reserva.estado}</span>`;
                        buttons = ``;
                    default:
                        estadoHTML = `<span>${reserva.estadoHTML}</span>`;
                }
            
            const reservaDiv = document.createElement('div');
            reservaDiv.classList.add('reservaItem');
            reservaDiv.dataset.id = reserva.id;
            reservaDiv.innerHTML += `
                <div class="reservaHeader">
                    <h3>${reserva.nombreCliente} #${reserva.id} ${estadoHTML}</h3>
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

export function confirmReservation(id) {
    fetch(`/app/Functions/dashboardAdmin/reservas.php?action=confirmReservation`, {
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

export function cancelReservation(id) {
    fetch(`/app/Functions/dashboardAdmin/reservas.php?action=cancelReservation`, {
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

export function assistReservation(id) {
    fetch(`/app/Functions/dashboardAdmin/reservas.php?action=assistReservation`, {
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

export function finalizeReservation(id) {
    fetch(`/app/Functions/dashboardAdmin/reservas.php?action=finalizeReservation`, {
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




/*=================================*/
/*===== VER MESAS DISPONIBLES =====*/
/*=================================*/
export function showTablesAvailables() {

    const btnShowTables = document.getElementById('showTablesStatus');
    const searchFilter = document.querySelector('.reservasFilters');
    const statusFilter = document.querySelector('.filters');
    const reservasSection = document.querySelector('.reservas-container');

    if (!btnShowTables) {
        console.error('No se encontró el botón para mostrar mesas disponibles.');
        return;
    }

    btnShowTables.addEventListener('click', () => {
        let mostrandoMesas = false;

        fetch(`/app/Functions/dashboardAdmin/reservas.php?action=showTablesAvailables`, {
            method: "GET",
            credentials: "same-origin",
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                reservasSection.replaceChildren(); // más seguro que innerHTML = ''
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

                const filterShowTables = document.createElement('div');
                filterShowTables.classList.add('filterShowTables');
                filterShowTables.innerHTML = `
                    <select class="filterTables" id="showTablasFilterAvailability">
                        <option value="todas">Todas las mesas</option>
                        <option value="disponible">Mesas disponibles</option>
                        <option value="ocupada">Mesas ocupadas</option>
                        <option value="reservada">Mesas reservadas</option>
                    </select>

                    <select class="filterTables" id="showTablesFilterCapacity">
                        <option value="todas">Todas las capacidades</option>
                        <option value="capacidad2">Capacidad 2</option>
                        <option value="capacidad4">Capacidad 4</option>
                        <option value="capacidad6">Capacidad 6</option>
                        <option value="capacidad8">Capacidad 8</option>
                    </select>

                    <button id="clearFiltersShowTables" class="clearFilters">Limpiar filtros</button>
                `;
                reservasSection.appendChild(filterShowTables);

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
                        <p class="tablesAbility" data-capacidad="${table.capacidad}"><strong>Capacidad:</strong> ${table.capacidad} personas</p>
                        <p><strong>Estado:</strong> ${table.estado}</p>
                    `;

                    tablesContainer.appendChild(tableDiv);

                });

                reservasSection.appendChild(tablesContainer);
                filtersShowTables();
            }
        })
        .catch(err => {
            console.error('Error al obtener mesas disponibles:', err);
        });
    });
}

function filtersShowTables () {
/*====== FILTROS PARA VER MESAS =========*/
    /*Filtro para ver por estado */
    const selectAvailability = document.getElementById('showTablasFilterAvailability');

    selectAvailability.addEventListener('change', (e) => {
        const selectedAvailability = e.target.value;
        const tables = document.querySelectorAll('.tableItem');
        tables.forEach(table => {
            switch(selectedAvailability) {
                case 'todas':
                    table.style.display = '';
                    break;
                case 'disponible':
                    table.style.display = table.classList.contains('mesa-disponible') ? '' : 'none';
                    break;
                case 'ocupada':
                    table.style.display = table.classList.contains('mesa-ocupada') ? '' : 'none';
                    break;
                case 'reservada':
                    table.style.display = table.classList.contains('mesa-reservada') ? '' : 'none';
                    break;
                default:
                    table.style.display = '';
            }
        }) 
    });

    /*Filtro para ver por capacidad*/
    const tablesAbility = document.getElementById('showTablesFilterCapacity');

    tablesAbility.addEventListener('change', (e) => {
        const selectedCapacity = e.target.value;
        const tables = document.querySelectorAll('.tableItem');
        tables.forEach(table => {
            const capacidad = table.querySelector('.tablesAbility').dataset.capacidad;            
            switch(selectedCapacity) {
                case 'todas':
                    table.style.display = '';
                    break;
                case 'capacidad2':
                    table.style.display = capacidad == 2 ? '' : 'none';
                    break;
                case 'capacidad4':
                    table.style.display = capacidad == 4 ? '' : 'none';
                    break;
                case 'capacidad6':
                    table.style.display = capacidad == 6 ? '' : 'none';
                    break;
                case 'capacidad8':
                    table.style.display = capacidad == 8 ? '' : 'none';
                    break;
                default:
                    table.style.display = '';
            }
        })
    });

    /*Borrar filtros*/
    const btnClearFilters = document.getElementById('clearFiltersShowTables');

    btnClearFilters.addEventListener('click', () => {
        console.log("Borrar filtros mesas");
        const tables = document.querySelectorAll('.tableItem');
        tables.forEach(table => {
            table.style.display = '';
                document.getElementById('showTablesFilterCapacity').value = 'todas';
                document.getElementById('showTablasFilterAvailability').value = 'todas';
        });
    });


}



