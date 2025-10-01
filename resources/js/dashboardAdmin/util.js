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
    //==================| --------- |===================

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

////==================| EVENTOS DE ABRIR FORMULARIO |===================
    function openAddWindow() {
        addUser.addEventListener("click", function() {
            windowAddUser.style.display = "block";
        });

        addProduct.addEventListener("click", function(){
            windowAddProduct.style.display = "block";
        })

        addIngredient.addEventListener("click", function() {
            windowAddIngredient.style.display = "block";
        })
    };

////==================| EVENTOS DE CERRAR FORMULARIO |===================
function closeAddWindow() {
    const closeBtnUser = document.getElementById("closeBtnUser");
    const closeBtnProduct = document.getElementById("closeBtnProduct");
    const closeBtnIngredient = document.getElementById("closeBtnIngredient");

    closeBtnUser.addEventListener("click", function(){
        const windowAddUser = document.getElementById("windowAddUser");
        windowAddUser.style.display = "none";
    });

    closeBtnProduct.addEventListener("click", function(){
        const windowAddProduct = document.getElementById("windowAddProduct");
        windowAddProduct.style.display = "none";
    });

    closeBtnIngredient.addEventListener("click", function(){
        const windowAddIngredient = document.getElementById("windowAddIngredient");
        windowAddIngredient.style.display = "none";
    });

        document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            // Si las ventanas están visibles, las cerramos
            if (windowAddUser.style.display === "block") {
                windowAddUser.style.display = "none";
            }
            if (windowAddProduct.style.display === "block") {
                windowAddProduct.style.display = "none";
            }
            if (windowAddIngredient.style.display === "block") {
                windowAddIngredient.style.display = "none";
            }
        }
    });
}

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