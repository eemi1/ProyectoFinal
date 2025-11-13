function initButtons() {
    const form = document.querySelector('.content1-form');
    const btnEdit = document.querySelector('.btn-edit');
    const btnSave = document.querySelector('.btn-save');
    const btnCancel = document.querySelector('.btn-cancel');
    const containerEdit = document.querySelector('.container-btn-edit');
    const containerSaveAndCancel = document.querySelector('.btns-SaveAndCancel');
    const inputs = document.querySelectorAll('.content1-form-input');

    // Al iniciar, ocultar botones guardar y cancelar
    btnSave.style.display = 'none';
    btnCancel.style.display = 'none';
    containerSaveAndCancel.style.display = 'none';

    btnEdit.addEventListener('click', (e) => {
        e.preventDefault();

        inputs.forEach(input => {
            if(input.name === 'email'){
                input.readOnly = true;
                input.style.backgroundColor = '#f0f0f0';
            } else {
                input.readOnly = false;
                input.style.backgroundColor = 'white';
            }
        });

        btnEdit.style.display = 'none';
        containerEdit.style.display = 'none';
        btnSave.style.display = 'flex';
        btnCancel.style.display = 'flex';
        containerSaveAndCancel.style.display = 'flex';
    });

    btnSave.addEventListener('click', (e) => {
        e.preventDefault();

        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Quieres actualizar la información?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar.',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: "#d33",
        }).then(result => {
            if(result.isConfirmed){
                const formData = new FormData(form);

                fetch("//Functions/dashboardUser/myProfile.php?action=saveController", {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                })
                .then(res => res.json())
                .then(data => {
                    console.log("Respuesta JSON:", data);
                    if(data.success){
                        inputs.forEach(input => {
                            input.dataset.original = input.value;
                            input.readOnly = true;
                            input.style.backgroundColor = '#ececec';
                        });

                        btnEdit.style.display = 'flex';
                        containerEdit.style.display = 'flex';
                        btnSave.style.display = 'none';
                        btnCancel.style.display = 'none';
                        containerSaveAndCancel.style.display = 'none';

                        Swal.fire({
                            title: '¡Hecho!',
                            text: 'Datos actualizados correctamente.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: data.message,
                            icon: 'error'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error en fetch:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo conectar con el servidor.',
                        icon: 'error'
                    });
                });
            } else {
                // Si cancela la confirmación, restaura los valores
                inputs.forEach(input => {
                    input.value = input.dataset.original;
                    input.readOnly = true;
                    input.style.backgroundColor = '#ececec';
                });

                btnEdit.style.display = 'flex';
                containerEdit.style.display = 'flex';
                btnSave.style.display = 'none';
                btnCancel.style.display = 'none';
                containerSaveAndCancel.style.display = 'none';
            }
        });
    });

    btnCancel.addEventListener('click', (e) => {
        e.preventDefault();

        inputs.forEach(input => {
            input.value = input.dataset.original;
            input.readOnly = true;
            input.style.backgroundColor = '#ececec';
        });

        btnEdit.style.display = 'flex';
        containerEdit.style.display = 'flex';
        btnSave.style.display = 'none';
        btnCancel.style.display = 'none';
        containerSaveAndCancel.style.display = 'none';
    });
}

function FechaMiembro(){
    fetch("/app/Functions/dashboardUser/myProfile.php?action=fechaMiembro", {
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.querySelector('.member-since').textContent = 'Miembro desde: ' + data.fechaFormateada;
        }
    });
}

function currentDateUser() {
    const name = document.getElementsByName('nombreCompleto')[0];
    const email = document.getElementsByName('email')[0];
    const tel = document.getElementsByName('telefono')[0];
    const fechaNacimiento = document.getElementsByName('fechaNacimiento')[0];
    
    fetch("/app/Functions/Auth/getSessionData.php", {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        if(data.success){

            if(!name || !email){
                console.log("Error: Usuario y email no encontrados");
                return;
            }

            name.dataset.original = data.usuario || '';
            name.value = data.usuario || '';

            email.dataset.original = data.email || '';
            email.value = data.email || '';

            tel.dataset.original = data.tel || '';
            tel.value = data.tel || '';

            fechaNacimiento.dataset.original = data.fechaNacimiento || '';
            fechaNacimiento.value = data.fechaNacimiento || '';
        }else{
            Swal.fire({
            title: "Sesión expirada",
            text: "Por favor, inicia sesión nuevamente.",
            icon: "warning"
        });
        }
    } )
}

function abrirModalDireccion() {
const modal = document.getElementById("modalDireccion");
const btn = document.getElementById("btnAgregarDireccion");
const close = document.querySelector(".close");

// Mostrar modal
btn.onclick = () => {
    modal.style.display = "block";
};

// Cerrar modal al hacer clic en la X
close.onclick = () => {
    modal.style.display = "none";
};

// Cerrar modal si se hace clic fuera del contenido
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};


}

function initDireccionForm() {
    const form = document.querySelector("#modalDireccion form");

    // Buscar .content2 y crear el contenedor dentro de ella
    const content2 = document.querySelector(".content2");
    let addressesContainer = content2.querySelector("#userAddresses");

    const countAddress = document.querySelector(".countAddress");

    if(!addressesContainer){
        addressesContainer = document.createElement("div");
        addressesContainer.id = "userAddresses";
        addressesContainer.classList.add("addresses-list"); // opcional para estilos
        content2.appendChild(addressesContainer);
    }

    // Función para cargar las direcciones
    function loadAddresses() {
        fetch("/app/Functions/dashboardUser/addressController.php?action=get", {
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(data => {
            addressesContainer.innerHTML = "";

            if(data.success) {
                
                data.direcciones.forEach(dir => {
                    if (dir.activo === 1 || dir.activo === "1"){
                        valorPredeterminado = `<p class='valorPredeterminado activo'>Predeterminado</p>`;
                    }else{
                        valorPredeterminado = "";
                    }
                    const div = document.createElement("div");
                    div.classList.add("addressItem");
                    div.innerHTML = `
                        <div class="addressIcon">
                            <i class="fa-solid fa-location-dot fa-2xl"></i>
                        </div>
                        <div class="addressContent">
                            <div class="contentHeader">
                            <h4 style="font-weight:bold;">${dir.alias || "Sin nombre"}</h4>
                            ${valorPredeterminado}
                            </div>
                            <span>${dir.calle}, Número: ${dir.numero}, ${dir.ciudad}, ${dir.departamento}, CP: ${dir.codigo_postal}</span>
                            <p>Indicaciones: ${dir.referencia}</p>
                        </div>
                        <div class="addressOptions">
                            <button class="editBtn" data-id="${dir.id}" id="iconEdit"><i class="fa-solid fa-pen-to-square fa-xl"></i></button>
                            <button class="deleteBtn" data-id="${dir.id}" id="iconDelete"><i class="fa-solid fa-trash fa-xl"></i></button>
                        </div>
                    `;
                    addressesContainer.appendChild(div);
                });

                // Agregar evento para eliminar
                document.querySelectorAll(".deleteBtn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const id = btn.dataset.id;
                        Swal.fire({
                            title: '¿Está seguro?',
                            text: 'Desea eliminar esta dirección?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar',
                            cancelButtonColor: "#d33",
                        }).then(result => {
                            if(result.isConfirmed){
                                fetch("/app/Functions/dashboardUser/addressController.php?action=delete", {
                                    method: "POST",
                                    credentials: 'same-origin',
                                    headers: {"Content-Type":"application/x-www-form-urlencoded"},
                                    body: `id=${id}`
                                })
                                .then(res => res.json())
                                .then(result => {
                                    if(result.success){
                                        loadAddresses();
                                        getCountAddresses()
                                    }
                                });
                            }
                        });
                    });
                });

                // Agregar evento para marcar predeterminada
                document.querySelectorAll(".predeterminado").forEach(cb => {
                    cb.addEventListener("change", () => {
                        const id = cb.dataset.id;
                        fetch("/app/Functions/dashboardUser/addressController.php?action=setPredetermined", {
                            method: "POST",
                            credentials: 'same-origin',
                            headers: {"Content-Type":"application/x-www-form-urlencoded"},
                            body: `id=${id}`
                        })
                        .then(res => res.json())
                        .then(result => {
                            if(result.success) loadAddresses();
                        });
                    });
                });
            }

        })
        .catch(error => console.error("Error al cargar direcciones:", error));
    }
    function getCountAddresses(){
        fetch("/app/Functions/dashboardUser/addressController.php?action=getCount", {
            method: "GET",
            credentials: "same-origin",
        })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            if (data.success){
                // console.log(data);
                countAddress.textContent = data.cantidad.cantidad + " Guardada(s)" || "0 Guardada(s)";
                loadAddresses();
            }
        })
    }

    // Cargar direcciones al inicio
    loadAddresses();
    getCountAddresses();

    // Guardar nueva dirección
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const modal = document.getElementById("modalDireccion");
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.predeterminado = formData.get("predeterminado") ? 1 : 0;

        fetch("/app/Functions/dashboardUser/addressController.php?action=save", {
            method: "POST",
            credentials: 'same-origin',
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => {
            if(result.success) {
                form.reset();
                loadAddresses();
                Swal.fire({title:"¡Hecho!", text:result.message, icon:"success", timer:1500, showConfirmButton:false});
                modal.style.display = "none";
                getCountAddresses();
            } else {
                Swal.fire({title:"Error", text:result.message, icon:"error"});
            }
        })
        .catch(error => console.error("Error al guardar dirección:", error));
    });
}

