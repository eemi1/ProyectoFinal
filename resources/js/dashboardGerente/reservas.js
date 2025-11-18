export function initReservas() {
    console.log("📅 initReservas ejecutado");

    getReservations(); 
    getStatsReservations();
    changeFilterReservations();
    showTablesAvailables(); 
}

/*=========================================*/
/*====== FILTROS RESERVAS Y MESAS =========*/
/*=========================================*/

function changeFilterReservations() {
    try {
        // ===== FILTROS RADIO =====
        const radios = document.querySelectorAll('.filterStatusReservations input[type="radio"]');
        if (radios.length > 0) {
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    getReservations(radio.value);
                });
            });
        }

        // ===== BUSCADOR =====
        const searchInput = document.getElementById('searchReservationsInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const filtro = e.target.value.toLowerCase();
                const reservas = document.querySelectorAll('.reservaItem');

                reservas.forEach(reserva => {
                    const texto = reserva.textContent.toLowerCase();
                    reserva.style.display = texto.includes(filtro) ? '' : 'none';
                });
            });
        }

        // ===== BOTÓN LIMPIAR =====
        const clearBtn = document.getElementById('clearFiltersReservations');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = "";
                getReservations();
            });
        }

    } catch (e) {
        console.error("Error en changeFilterReservations:", e);
    }
}




/*===================================*/
/*===== VER RESERVAS PENDIENTES =====*/
/*===================================*/

function getReservations(estado = 'todas') {
    fetch(`/app/Functions/dashboardGerente/reservas.php?action=getReservations&estado=${estado}`, {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        const reservasSection = document.querySelector('.reservas-container');
        if (!data.success || data.reservas.length === 0) {
            // Si no hay reservas, mostrar el contenido por defecto
            reservasSection.innerHTML = `
                <div class="reservas-default">
                    <div id="container-default-text">
                        <h1 id="default-title">Historial de Reservas de HOY</h1>
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
                // 🔹 Formato automático DD/MM/YYYY
                const fechaReservaFormateada = new Date(reserva.fechaReserva).toLocaleDateString('es-ES');
                const fechaActualFormateada = new Date(reserva.fechaActual).toLocaleDateString('es-ES');

                try {
                    document.getElementById('reservasTurno').textContent = data.confirmedReservations || 0;
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
    fetch(`/app/Functions/dashboardGerente/reservas.php?action=confirmReservation`, {
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
    fetch(`/app/Functions/dashboardGerente/reservas.php?action=cancelReservation`, {
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
    fetch(`/app/Functions/dashboardGerente/reservas.php?action=assistReservation`, {
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
    fetch(`/app/Functions/dashboardGerente/reservas.php?action=finalizeReservation`, {
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
let mesasBtnLinked = false;
let mostrandoMesas = false;

export function showTablesAvailables() {

    const btn = document.getElementById('showTablesStatus');
    const filtros = document.querySelector('.filters');
    const buscador = document.querySelector('.reservasFilters');
    const contenedor = document.querySelector('.reservas-container');

    if (!btn) return;
    if (mesasBtnLinked) return;
    mesasBtnLinked = true;

    btn.addEventListener('click', () => {

        mostrandoMesas = !mostrandoMesas;

        if (!mostrandoMesas) {
            filtros.style.display = 'flex';
            buscador.style.display = 'flex';
            btn.textContent = "Ver Estado de Mesas";
            getReservations();
            return;
        }

        filtros.style.display = 'none';
        buscador.style.display = 'none';
        btn.textContent = "Ver Reservas";

        fetch(`/app/Functions/dashboardGerente/reservas.php?action=showTablesAvailables`)
            .then(res => res.json())
            .then(data => {
                if (!data.success) return;

                contenedor.replaceChildren();

                const header = document.createElement('h3');
                header.textContent = 'Estado de Mesas';
                contenedor.appendChild(header);

                const filtrosMesas = document.createElement('div');
                filtrosMesas.classList.add('filterShowTables');

                filtrosMesas.innerHTML = `
                    <select id="showTablasFilterAvailability">
                        <option value="todas">Todas</option>
                        <option value="disponible">Disponibles</option>
                        <option value="ocupada">Ocupadas</option>
                        <option value="reservada">Reservadas</option>
                    </select>

                    <select id="showTablesFilterCapacity">
                        <option value="todas">Todas</option>
                        <option value="capacidad2">Capacidad 2</option>
                        <option value="capacidad4">Capacidad 4</option>
                        <option value="capacidad6">Capacidad 6</option>
                        <option value="capacidad8">Capacidad 8</option>
                    </select>

                    <button id="clearFiltersShowTables">Limpiar</button>
                `;

                contenedor.appendChild(filtrosMesas);

                const tablaCont = document.createElement('div');
                tablaCont.classList.add('tables-container');

                data.mesas.forEach(m => {
                    const d = document.createElement('div');
                    d.classList.add('tableItem');

                    d.classList.add({
                        disponible: 'mesa-disponible',
                        ocupada: 'mesa-ocupada',
                        reservada: 'mesa-reservada'
                    }[m.estado] || 'mesa-desconocida');

                    d.innerHTML = `
                        <h3>Mesa #${m.id}</h3>
                        <p class="tablesAbility" data-capacidad="${m.capacidad}"><strong>Capacidad:</strong> ${m.capacidad}</p>
                        <p><strong>Estado:</strong> ${m.estado}</p>
                    `;

                    tablaCont.appendChild(d);
                });

                contenedor.appendChild(tablaCont);
                filtersShowTables();
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

export async function getStatsReservations() {
    try{
        const res = await fetch('/app/Functions/dashboardGerente/reservas.php?action=getTableStats')
        const data = await res.json();

        if (data.success){
            console.log(data);
            document.getElementById('ocupacionActual').textContent = `${data.porcentajeOcupacion}%`;
            document.getElementById('ocupacionTotalFooter').textContent = `${data.mesasOcupadas} de ${data.totalMesas} mesas`
            
        }
    }catch(error){
        console.log('Error al obtener las estadísticas de las reservas', error);
    }
}



