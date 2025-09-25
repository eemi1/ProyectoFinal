window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("defaultTab").click();
    chartVentas();
    loadUsers();
    usersTotal();
    openAddWindow();
    closeAddWindow();
    filterCategories();
    loadIngredients();
    ingredientsTotal();
    initSearches();
    showModalProductsAddIngredients();

});
function initSearches() {
    // --- Ingredientes ---
    const inputSearchIngredients = document.getElementById("searchInputIngredients");
    inputSearchIngredients.addEventListener("input", () => {
        loadIngredients(inputSearchIngredients.value);
    });
    loadIngredients(); 

    // --- Usuarios ---
    const inputSearchUsers = document.getElementById("searchInputUsers");
    inputSearchUsers.addEventListener("input", () => {
        loadUsers(inputSearchUsers.value); 
    });
    loadUsers(); 

    // --- Productos ---
    const inputSearchProducts = document.getElementById("searchInputProducts");
    inputSearchProducts.addEventListener("input", () => {
        loadProducts(inputSearchProducts.value); 
    });
    loadProducts(); 
}

//============================== FUNCION PARA CAMBIAR DE PESTAÑAS ==============================
function options(event, tabOption){
    event.preventDefault();

    document.querySelectorAll('.optContent').forEach(tab => {
        tab.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabOption);
    if(selectedTab){
        selectedTab.style.display = 'flex';
    }

    document.querySelectorAll('.sidebar-options').forEach(link => {
        link.classList.remove('active');
    });

    event.currentTarget.classList.add('active');
}
//============================== FUNCIONES PRINCIPALES ==============================
function openAddWindow() {
    //==================| VARIABLES |===================

    //-------Varible Ventanas-------------
    const windowAddUser = document.getElementById("windowAddUser");
    const windowAddProduct = document.getElementById("windowAddProduct");
    const windowAddIngredient = document.getElementById("windowAddIngredient");


    //-------Varible Botones-------------
    const addUser = document.getElementById("openAddUserWindow");
    const addProduct = document.getElementById("openAddProductWindow");
    const addIngredient = document.getElementById("openAddIngredientWindow");

    //-------Varible Formularios-------------
    const formUser = document.getElementById("addUserForm");
    const formIngredients = document.getElementById("addIngredientForm");
    const formProducts = document.getElementById("addProductForm");

    //-------Eventos de escucha de click en el botón.-------------
    addUser.addEventListener("click", function() {
        windowAddUser.style.display = "block";
    });

    addProduct.addEventListener("click", function(){
        windowAddProduct.style.display = "block";
    })

    addIngredient.addEventListener("click", function() {
        windowAddIngredient.style.display = "block";
    })

////==================| Eventos de envío de formularios |===================
    if (formUser) {
        formUser.addEventListener("submit", function(e) {
            e.preventDefault();
            windowAddUser.style.display = "none"; 

            Swal.fire({
                title: '¿Estás seguro?',
                text: 'Deseas registrar este nuevo usuario?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, registrar',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: "#d33",
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData(formUser);

                    fetch("/proyectoFinal/app/Functions/dashboardAdmin/usuarios.php?action=addUsers", {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            windowAddUser.style.display = "none";
                            Swal.fire({
                                title: 'Excelente!',
                                text: 'Nuevo usuario registrado correctamente.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => location.reload());
                        } else {
                            Swal.fire('Error', data.message, 'error');
                        }
                    })
                    .catch(() => {
                        Swal.fire('Error', 'Ocurrió un error al intentar conectarse con el servidor.', 'error');
                    });
                }
            });
        });
    }

    // Submit ingredientes
    if (formIngredients) {
        formIngredients.addEventListener("submit", function(e) {
            e.preventDefault();
            windowAddIngredient.style.display = "none"; 
            Swal.fire({
                title: '¿Estás seguro?',
                text: 'Deseas registrar este nuevo ingrediente?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, registrar',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: "#d33",
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData(formIngredients);

                    fetch("/proyectoFinal/app/Functions/dashboardAdmin/ingredientes.php?action=addIngredient", {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            windowAddIngredient.style.display = "none";
                            Swal.fire({
                                title: 'Excelente!',
                                text: 'Nuevo ingrediente registrado correctamente.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => location.reload());
                        } else {
                            Swal.fire('Error', data.message, 'error');
                        }
                    })
                    .catch(() => {
                        Swal.fire('Error', 'Ocurrió un error al intentar conectarse con el servidor.', 'error');
                    });
                }
            });
        });
    }
    if (formProducts) {
        formProducts.addEventListener("submit", function(e) {
            e.preventDefault();
            windowAddProduct.style.display = "none"; 

            Swal.fire({
                title: '¿Estás seguro?',
                text: 'Deseas registrar este nuevo producto?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, registrar',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: "#d33",
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData(formProducts);

                    fetch("/proyectoFinal/app/Functions/dashboardAdmin/productos.php?action=addProduct", {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            windowAddIngredient.style.display = "none";
                            Swal.fire({
                                title: 'Excelente!',
                                text: 'Nuevo producto registrado correctamente.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => location.reload());
                        } else {
                            Swal.fire('Error', data.message, 'error');
                        }
                    })
                    .catch(() => {
                        Swal.fire('Error', 'Ocurrió un error al intentar conectarse con el servidor.', 'error');
                    });
                }
            });
        });
    }
    }



////==================| EVENTOS DE CERRAR FORMULARIO |===================

function closeAddWindow() {
    const closeBtnUser = document.getElementById("closeBtnUser");
    const closeBtnProduct = document.getElementById("closeBtnProduct");
    const closeBtnIngredient = document.getElementById("closeBtnIngredient")

    closeBtnUser.addEventListener("click", function(){
        const windowAddUser = document.getElementById("windowAddUser");
        windowAddUser.style.display = "none";
    })

    closeBtnProduct.addEventListener("click", function(){
        const windowAddProduct = document.getElementById("windowAddProduct");
        windowAddProduct.style.display = "none";
    })

    closeBtnIngredient.addEventListener("click", function(){
        const windowAddIngredient = document.getElementById("windowAddIngredient");
        windowAddIngredient.style.display = "none";
    })
}

//============================== PESTAÑA DASHBOARD PRINCIPAL ==============================
function chartVentas(){
    var chart = new CanvasJS.Chart("ventasChart", {
	theme: "light1", // "light2", "dark1", "dark2"
	animationEnabled: true, // change to true		
    axisY:{
        gridThickness: 0,
        lineThickness: 0,
        labelFormatter: function () { return ""; },

    },
    axisX:{
        lineThickness: 0,
        tickLength: 0,
        gridThickness: 0,
        reversed:true,
    },
	data: [
	{
		// Change type to "bar", "area", "spline", "pie",etc.
		type: "bar",
		dataPoints: [
			{ label: "Lunes",  y: 10  },
			{ label: "Martes", y: 15  },
			{ label: "Miércoles", y: 25  },
			{ label: "Jueves",  y: 30  },
			{ label: "Viernes",  y: 28  },
            { label: "Sábado",  y: 32  },
            { label: "Domingo",  y: 24  }
		]
	}
	]
});
chart.render();

}
////==================| EVENTOS DE CARGA DE DATOS DE BD |===================
function loadUsers(inputSearchUsers = '', rolValue = '') {

    fetch("/proyectoFinal/app/Functions/dashboardAdmin/usuarios.php?action=mostrarUsuarios", {
        method: 'POST',
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: inputSearchUsers, valueRol: rolValue })
    })
    .then(res => res.json())
    .then(data => {
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
            icon = "";
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
                <td>0</td>
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

function loadIngredients(inputSearchIngredients = '') {

    fetch("/proyectoFinal/app/Functions/dashboardAdmin/ingredientes.php?action=showIngredients", {
        method: 'POST',
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: inputSearchIngredients })
    })
    .then(res => res.json())
    .then(data => {
        const tableBody = document.querySelector("#table-ingredients tbody");
        if (!data.success) {
            tableBody.innerHTML = `<tr><td colspan="6">${data.message}</td></tr>`;
            return;
        }

        tableBody.innerHTML = ""; // limpiar tabla

        data.data.ingredientes.forEach(ingrediente => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td id="ingredientsTable-td">
                    <strong>${ingrediente.nombre}</strong>
                    <span>${ingrediente.descripcion}</span>
                </td>
                <td>${ingrediente.unidad}</td>
                <td>${ingrediente.stock_actual}</td>
                <td>${ingrediente.stock_minimo}</td>
                <td>${ingrediente.proveedor}</td>
                <td>off</td>
                <td>off</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(err => console.error(err));
}
function loadProducts(inputSearchProducts = '') {

    fetch("/proyectoFinal/app/Functions/dashboardAdmin/productos.php?action=showProducts", {
        method: 'POST',
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: inputSearchProducts })
    })
    .then(res => res.json())
    .then(data => {
        const tableBody = document.querySelector("#table-products tbody");
        if (!data.success) {
            tableBody.innerHTML = `<tr><td colspan="6">${data.message}</td></tr>`;
            return;
        }

        tableBody.innerHTML = ""; // limpiar tabla

        data.data.productos.forEach(producto => {

            let ingredientesList = "";
            producto.ingredientes.forEach(ingrediente => {
                ingredientesList += `<p class="productsTable-td-ingredientesList">${ingrediente}</p>`;
            });

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${producto.id}</td>
                <td id="productsTable-td">
                    <strong>${producto.nombre}</strong>
                    <span>${producto.descripcion}</span>
                </td>
                <td>${producto.categoria}</td>
                <td>${producto.precio} $</td>
                <td id="productTable-td-ingredientes">${ingredientesList}</td>
                <td>${producto.promocion ? 'Sí' : 'Sin Descuento'}</td>
                <td>off</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(err => console.error(err));
}
//============================== PESTAÑA DASHBOARD USUARIOS ==============================
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
    fetch("/proyectoFinal/app/Functions/dashboardAdmin/usuarios.php?action=CantidadUsuarios", {
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
function ingredientsTotal() {
    fetch("/proyectoFinal/app/Functions/dashboardAdmin/ingredientes.php?action=ingredientsAmount", {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById("totalIngredientsNumber").textContent = `(${data.totalIngredientes})`;
        }
    })
    .catch(error => console.error("Error al obtener total de ingredientes:", error));
}



function btnActionsUser(event) {

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
                    fetch("/proyectoFinal/app/Functions/dashboardAdmin/usuarios.php?action=deleteUser", {
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

    fetch("/proyectoFinal/app/Functions/dashboardAdmin/usuarios.php?action=editUser", {
        method: "POST",
        body: formData,
        credentials: "same-origin"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
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

//============================== PESTAÑA DASHBOARD PRODUCTOS ==============================

function filterCategories() {
    const btnFilterCategories = document.querySelectorAll(".btnForms");
    const list = document.querySelector(".container-list-span-categories");

    if (!btnFilterCategories || !list) return;

    btnFilterCategories.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            list.style.display = (list.style.display === "flex") ? "none" : "flex";
        });
    });
}

function showModalProductsAddIngredients(){

    const btnIngredients = document.getElementById("productModal-inputSearchSelectIngredients")
    const checkboxIngredientsList = document.getElementById("productModal-addIngredients-container")

    checkboxIngredientsList.style.display="none"

    if(!btnIngredients || !checkboxIngredientsList) return;



    btnIngredients.addEventListener("click", function(e) {
        e.preventDefault();
        if(checkboxIngredientsList.style.display === "flex") {
            checkboxIngredientsList.style.display="none";
            return;
        }   
        checkboxIngredientsList.style.display="flex";
        getIngredients();

    })
}

function getIngredients(){
        fetch("/proyectoFinal/app/Functions/dashboardAdmin/ingredientes.php?action=showIngredients", {
        method: "GET",
        credentials: "same-origin"
    })
    .then(res => res.json())
    .then(data => {
        const ingredientInfo = document.querySelector("#productModal-addIngredint-checkboxs");
        if (!data.success) {
            ingredientInfo.innerHTML = `<tr><td colspan="6">${data.message}</td></tr>`;
            return;
        }

        ingredientInfo.innerHTML = ""; 

        data.data.ingredientes.forEach(ingrediente => {
            ingredientInfo.innerHTML += `

            <div class="productModal-addIngredient-checkboxcontainer">
                <label>
                    <input type="checkbox" name="productIngrediente[]" value="${ingrediente.id}">
                    <div class="ingredient-info">
                        <strong>${ingrediente.nombre}</strong>
                        <span>${ingrediente.descricpcion}</span>
                        <p>Stock ${ingrediente.stock_actual}${ingrediente.unidad} | </p>
                    </div>
                </label>
            </div>
            `;
        });
    })
}

//--------------------- TABLA PRODUCTOS ---------------------------
