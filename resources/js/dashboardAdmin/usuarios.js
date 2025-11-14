// usuarios.js
export function initUsuarios() {
    console.log("initUsuarios ejecutado");
    loadUsers();
    filterRoles();
    usersTotal();
    initSearchUsuarios();
}

////==================| PESTAÑA DASHBOARD USUARIOS |===================
function loadUsers(inputSearchUsers = '', rolValue = '') {

    fetch("/app/Functions/dashboardAdmin/usuarios.php?action=mostrarUsuarios", {
        method: 'POST',
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: inputSearchUsers, valueRol: rolValue })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        const userTableBody = document.querySelector("#table-users tbody");
        if (!data.success) {
            userTableBody.innerHTML = `<tr><td>${data.message}</td></tr>`;
            return;
        }

        userTableBody.innerHTML = ""; // limpiar tabla

        const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#16a34a" viewBox="0 0 24 24"><circle cx="12" cy="7" r="5"/><path d="M12 14c-5 0-9 2.5-9 6v1h18v-1c0-3.5-4-6-9-6z"/></svg>`;
        const defaultImg = `data:image/svg+xml;utf8,${encodeURIComponent(defaultSvg)}`;

        data.data.usuarios.forEach(user => {
            let rolClass = "";
            let icon = "";
            switch(user.id_rol){
                case 1: icon=`<i class="fa-solid fa-user"></i>`; rolClass="rol-cliente"; break;
                case 2: icon=`<i class="fa-solid fa-crown"></i>`; rolClass="rol-admin"; break;
                case 3: icon=`<i class="fa-solid fa-bell-concierge"></i>`; rolClass="rol-mozo"; break;
                case 4: icon=`<i class="fa-solid fa-kitchen-set"></i>`; rolClass="rol-cocinero"; break;
                case 5: icon=`<i class="fa-solid fa-user-shield"></i>`; rolClass="rol-gerente"; break;
                case 6: icon=`<i class="fa-solid fa-truck"></i>`; rolClass="rol-delivery"; break;
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <div class="container-user">
                        <div class="container-user-image">
                            <img src="${user.image || defaultImg}" alt="User Image">
                        </div>
                        <div class="container-user-info">
                            <p class="user-name">${user.nombreCompleto}</p>
                            <div class="user-email-container">
                                <i class="fa-regular fa-envelope"></i><p class="user-email">${user.mail}</p>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="${rolClass}">
                        ${icon} ${user.rol}
                    </div>
                </td>
                <td>${user.totalPedidos}</td>
                <td><i class="fa-solid fa-calendar" style="color: #969696;"></i> ${user.fechaRegistro}</td>
                <td style="position: relative;">
                    <button class="btnOptions" onclick="btnActionsUser(event)">
                        <i class="fa-solid fa-ellipsis fa-lg"></i>
                    </button>
                    <ul class="optionsTableUsers-list">
                        <li class="delete-user" data-id="${user.id}"><i class="fa-solid fa-trash"></i> Eliminar Usuario</li>
                        <li class="edit-user" data-id="${user.id}"><i class="fa-solid fa-user-pen"></i> Editar Usuario</li>
                        <li class="change-password" data-id="${user.id}"><i class="fa-solid fa-lock"></i> Cambiar Contraseña</li>
                    </ul>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        deleteUser();
        editUser();
    });
}

function initSearchUsuarios() {
    const inputSearchUsers = document.getElementById("searchInputUsers");
    if (!inputSearchUsers) return;

    inputSearchUsers.addEventListener("input", () => {
        loadUsers(inputSearchUsers.value);
    });

    // Cargar lista inicial
    loadUsers();
}

function filterRoles() {
    const btnFilterRoles = document.getElementById("searchButton-roles");
    const containerListSpan = document.querySelector(".container-list-span");
    const listsSpan = document.querySelectorAll(".list-span");

    const rolesMap = {
        1: "Cliente",
        2: "Administrador",
        3: "Mozo",
        4: "Cocinero",
        5: "Gerente",
        6: "Delivery"
    };

    const svg = `<svg id="searchBTN-card-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
                </svg>`;

    btnFilterRoles.addEventListener("click", () => {
        containerListSpan.style.display = containerListSpan.style.display === "flex" ? "none" : "flex";
    });

    listsSpan.forEach(span => {
        span.addEventListener("click", function() {
            const rolValue = parseInt(this.getAttribute("data-value"));
            const rolName = rolesMap[rolValue] || "Todos los roles";

            btnFilterRoles.innerHTML = `${rolName} ${svg}`;
            containerListSpan.style.display = "none";

            loadUsers(rolValue);
            usersTotal(rolValue);  
        });
    });
}
function usersTotal() {
    fetch("/app/Functions/dashboardAdmin/usuarios.php?action=CantidadUsuarios", {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById("totalUsersNumber").textContent = `(${data.totalUsuarios})`;
        }
    })
    .catch(error => console.error("Error al obtener total de usuarios:", error));
}




export function btnActionsUser(event) {

    const btn = event.currentTarget;
    const optionsList = btn.parentElement.querySelector(".optionsTableUsers-list");

    // Revisamos si el menú estaba visible antes
    const isVisible = optionsList.style.display === 'block';

    // Ocultamos todos los menús
    document.querySelectorAll(".optionsTableUsers-list").forEach(list => {
        list.style.display = 'none';
    });

    // Si antes no estaba visible, lo mostramos (toggle)
    if (!isVisible) {
        optionsList.style.display = 'block';
    }
}

function deleteUser() {
    document.querySelectorAll(".delete-user").forEach(item => {

        item.addEventListener("click", function() {
            const userId = item.dataset.id;

            Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: "#d33",
            }).then((result) => {
                if (result.isConfirmed) {  
                    fetch("/app/Functions/dashboardAdmin/usuarios.php?action=deleteUser", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userId: userId })
                    }).then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                title: 'Eliminado!',
                                text: data.message,
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: 'Error',
                                text: data.message,
                                icon: 'error',
                                confirmButtonText: 'Ok'
                            });
                        }
                    });

                }
            });

        });
    });
}

function editUser() {
    // Abrir modal y llenar datos
document.querySelectorAll(".edit-user").forEach(btn => {
    btn.addEventListener("click", function() {
        const row = btn.closest("tr");
        const userId = btn.dataset.id;
        const nombre = row.querySelector(".user-name").textContent;


        const modal = document.querySelector(".modalEditUser");
        modal.style.display = "block";

        document.getElementById("editUsername").value = nombre;

        // Guardar el userId en un input hidden
        document.getElementById("editUserId").value = userId;
    });
});

// Cerrar modal
document.getElementById("closeEditUserBtn").addEventListener("click", () => {
    document.querySelector(".modalEditUser").style.display = "none";
});

// Enviar formulario
document.getElementById("editUserForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);

    fetch("/app/Functions/dashboardAdmin/usuarios.php?action=editUser", {
        method: "POST",
        body: formData,
        credentials: "same-origin"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log(data);
            Swal.fire({
                title: "Editado!",
                text: data.message,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            }).then(() => location.reload());
        } else {
            Swal.fire("Error", data.message, "error");
        }
    });
});
}

