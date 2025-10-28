function getReservations() {
    fetch("/proyectoFinal/app/Functions/dashboardAdmin/reservas.php?action=getReservations", {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
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

            if (!puedeCancelar || reserva.estado === 'Cancelado') {
                botonDeshabilitado = 'disabled';
                textoBoton = 'Cancelación no disponible';
            } else {
                botonDeshabilitado = '';
                textoBoton = 'Cancelar reserva';
            }
            
            const reservaDiv = document.createElement('div');
            reservaDiv.classList.add('reservaItem');
            reservaDiv.innerHTML += `
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
                        data-codigo="${reserva.codigoReserva}" ${botonDeshabilitado}>
                        ${textoBoton}
                    </button>
                </div>
            `;
            
                reservasSection.appendChild(reservaDiv);
            });
        }    
    })
    .catch(err => console.error('Error al obtener reservas:', err));
}