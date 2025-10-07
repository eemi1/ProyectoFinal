document.addEventListener("DOMContentLoaded", () => {
    // Abrir la pestaña por defecto
    document.getElementById("defaultTab").click();

    // Verificar sesión
    fetch("/proyectoFinal/app/Functions/check.php?action=verificar")
    .then(res => res.json())
    .then(data => {
        console.log(data);
        if(!data.success){
            console.log(data.message);
            window.location.href = "/proyectoFinal/app/View/Auth/Login.html";
        } else {
            console.log(data.message);
        }
    });

    // Inicializar botones
    initButtons();
    FechaMiembro();
    abrirModalDireccion()

});

function openTab(event, tabOption){
    event.preventDefault();

    document.querySelectorAll('.tabcontent').forEach(tab => {
        tab.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabOption);
    if(selectedTab){
        selectedTab.style.display = 'flex';
    }

    document.querySelectorAll('.tablinks').forEach(link => {
        link.classList.remove('active');
    });

    event.currentTarget.classList.add('active');
}

function initButtons() {
    const form = document.querySelector('.content1-form'); // O usa id si tienes
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

                fetch("/proyectoFinal/app/Functions/myProfile/myProfile.php?action=saveController", {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                })
                .then(res => res.json())
                .then(data => {
                    console.log("Respuesta JSON:", data);
                    if(data.success){
                        inputs.forEach(input => {
                            input.setAttribute('data-original-value', input.value);
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
                    input.value = input.getAttribute('data-original-value');
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
            input.value = input.getAttribute('data-original-value');
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
    fetch("/proyectoFinal/app/Functions/myProfile/myProfile.php?action=fechaMiembro", {
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.querySelector('.member-since').textContent = 'Miembro desde: ' + data.fechaFormateada;
        }
    });
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
