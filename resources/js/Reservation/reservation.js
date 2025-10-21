document.addEventListener("DOMContentLoaded", () => {
    minDate();
    addReservation();
    setupMesaLoader();

})
function minDate() {
    const inputDate = document.getElementById("date");
    const hoy = new Date();
    const dia = String(hoy.getDate() + 1).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = String(hoy.getFullYear()).padStart(2, '0');
    const fechaActual = (año+"-"+mes+"-"+dia);

    inputDate.setAttribute("min", fechaActual);
}

function setupMesaLoader() {
    const date = document.getElementById("date");
    const time = document.getElementById("time");
    const numberPeople = document.getElementById("numberPeople");
    const mesaContainer = document.getElementById("mesaContainer");
    let selectedMesaId = null;

    function cargarMesas() {
        const fecha = date.value;
        const hora = time.value;
        const personas = numberPeople.value;

        if (!fecha || !hora || personas === "default") return;

        fetch("/proyectoFinal/app/Functions/reservations/getAvailableTables.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: fecha, time: hora, numberPeople: personas }),
        })
        .then(res => res.json())
        .then(data => {
            mesaContainer.innerHTML = "";

            if (data.success && data.mesas.length > 0) {
                mesaContainer.style.display = "grid";
                mesaContainer.classList.add("mesa-grid"); // aplicar grid CSS
                
                data.mesas.forEach(mesa => {
                    const mesaDiv = document.createElement("div");
                    mesaDiv.classList.add("mesa-card");

                    mesaDiv.innerHTML = `
                        <h3 class="mesa-title">Mesa ${mesa.numero}</h3>
                        <p class="mesa-capacidad">Capacidad: ${mesa.capacidad}</p>
                        <p class="mesa-estado">Disponible</p>
                    `;

                    mesaDiv.addEventListener("click", () => {
                        document.querySelectorAll(".mesa-card").forEach(d => d.classList.remove("selected"));
                        mesaDiv.classList.add("selected");
                        selectedMesaId = mesa.id;
                        document.getElementById("selectedMesa").value = selectedMesaId; // <-- actualiza hidden
                    });

                    mesaContainer.appendChild(mesaDiv);
                });
            } else {
                mesaContainer.style.display = "none";
                Swal.fire("Sin mesas disponibles", data.message || "No hay mesas para ese horario.", "info");
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire("Error", "No se pudieron cargar las mesas.", "error");
        });
    }

    date.addEventListener("change", cargarMesas);
    time.addEventListener("change", cargarMesas);
    numberPeople.addEventListener("change", cargarMesas);

    // Retornar selectedMesaId para usarlo al enviar reserva
    return () => selectedMesaId;
}

function addReservation() {
    const form = document.querySelector(".form");
    


    form.addEventListener("submit", function(e){
        e.preventDefault();

        const time = form.time.value;
        const numberPeople = form.numberPeople.value;

        if (time === "default" || numberPeople === "default") {
            Swal.fire("Campos incompletos", "Por favor selecciona hora y cantidad de personas.", "warning");
            return;
        }

        Swal.fire({
                title: 'Confirmar Reserva?',
                text: 'Deseas registrar esta nueva reserva?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, registrar',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: "#d33",
        }).then((result) => {
            if (result.isConfirmed) {
                
                const formData = new FormData(form);
                try{
                    fetch("/proyectoFinal/app/Functions/reservations/addReservation.php", {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            // Aquí llamamos al modal pasando los datos que nos devuelve el servidor
                            showReservationModal({
                                codigo: data.codigo,          // Código de confirmación generado en PHP
                                fecha: form.date.value,       // Fecha de la reserva
                                hora: form.time.value,        // Hora
                                personas: form.numberPeople.value, // Cantidad de personas
                                mesa: data.mesa,        // Número de la mesa reservada (de PHP)
                                nombre: data.nombre,          // Nombre del usuario
                                telefono: data.telefono,      // Teléfono
                                email: data.email             // Email
                            });
                        
                            form.reset();
                        } else {
                            Swal.fire('Error', data.message, 'error');
                        }
                    });
                }catch(error){
                    Swal.fire("Error de conexión", "Hubo un problema con el servidor.", "error"); 
                    console.error(error);
                }
            }
            if (!confirm.isConfirmed) return;
        })
        
    })

}

function showReservationModal(reservaData) {
    // reservaData: {codigo, fecha, hora, personas, mesa, nombre, telefono, email}

    const modal = document.createElement('div');
    modal.classList.add('modalAddReservation');

    modal.innerHTML = `
        <div class="modalContainer">
            <span class="closeBtn">&times;</span>

            <div class="modalHeader">
                <svg width="80px" height="80px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <g id="icomoon-ignore"></g>
                    <path d="M16 2.672c-7.361 0-13.328 5.967-13.328 13.328s5.968 13.328 13.328 13.328c7.361 0 13.328-5.967 13.328-13.328s-5.967-13.328-13.328-13.328zM16 28.262c-6.761 0-12.262-5.501-12.262-12.262s5.5-12.262 12.262-12.262c6.761 0 12.262 5.501 12.262 12.262s-5.5 12.262-12.262 12.262z" fill="#000000"></path>
                    <path d="M22.667 11.241l-8.559 8.299-2.998-2.998c-0.312-0.312-0.818-0.312-1.131 0s-0.312 0.818 0 1.131l3.555 3.555c0.156 0.156 0.361 0.234 0.565 0.234 0.2 0 0.401-0.075 0.556-0.225l9.124-8.848c0.317-0.308 0.325-0.814 0.018-1.131-0.309-0.318-0.814-0.325-1.131-0.018z" fill="#000000"></path>
                </svg>
                <h5>¡Reserva Confirmada!</h5>
                <p>Tu reserva ha sido registrada exitosamente</p>
            </div>

            <div class="modalMain">
                <div class="modalMainHeader">
                    <p>Código de confirmación</p>
                    <span>${reservaData.codigo}</span>
                </div>
                <hr>
                <div class="modalMainContent">
                    <span><i class="fa-regular fa-calendar"></i> ${reservaData.fecha}</span>
                    <span><i class="fa-regular fa-clock"></i> ${reservaData.hora}</span>
                    <span>👥 ${reservaData.personas} persona(s)</span>
                    <span>🪑 Mesa ${reservaData.mesa}</span>
                </div>
                <hr>
                <div class="modalMainFooter">
                    <span><i class="fa-solid fa-phone"></i> ${reservaData.telefono}</span>
                    <span><i class="fa-regular fa-envelope"></i> ${reservaData.email}</span>
                </div>
            </div>

            <div class="modalFooter">
                <p><i class="fa-solid fa-check"></i> Se ha enviado una confirmación a tu email.</p>
                <p><i class="fa-solid fa-check"></i> Presenta este código al llegar al restaurante</p>
                <p><i class="fa-solid fa-check"></i> Tiempo de gracia: 15 minutos.</p>
                <p><i class="fa-solid fa-check"></i> Cancelar con menos de 2 horas de anticipación</p>
                <p><i class="fa-solid fa-check"></i> En caso de reservar y no asistir se penalizará gravemente</p>
            </div>

            <div class="modalSubmit">
                <button type="button" class="modalSubmit">Entendido</button>
            </div>
        </div>
    `;

    // Funcionalidad de cerrar
    modal.querySelector('.closeBtn').addEventListener('click', () => modal.remove());
    modal.querySelector('.modalSubmit').addEventListener('click', () => modal.remove());

    document.body.appendChild(modal);
}
