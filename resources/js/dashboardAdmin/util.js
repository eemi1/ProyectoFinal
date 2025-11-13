 
    
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

async function initSearches() {
    const inputSearchIngredients = document.getElementById("searchInputIngredients");
    if (inputSearchIngredients) {
        const { loadIngredients } = await import(`resources/js/dashboardAdmin/ingredientes.js`);
        inputSearchIngredients.addEventListener("input", () => {
            loadIngredients(inputSearchIngredients.value);
        });
        loadIngredients();
    }

    const inputSearchUsers = document.getElementById("searchInputUsers");
    if (inputSearchUsers) {
        const { loadUsers } = await import(`resources/js/dashboardAdmin/usuarios.js`);
        inputSearchUsers.addEventListener("input", () => {
            loadUsers(inputSearchUsers.value); 
        });
        loadUsers();
    }

    const inputSearchProducts = document.getElementById("searchInputProducts");
    if (inputSearchProducts) {
        const { loadProducts } = await import(`resources/js/dashboardAdmin/producto.js`);
        inputSearchProducts.addEventListener("input", () => {
            loadProducts(inputSearchProducts.value); 
        });
        loadProducts();
    }
}

//============================== FUNCION PARA CAMBIAR DE PESTAÑAS ==============================
async function options(event, tabOption){
    event.preventDefault();

    document.querySelectorAll('.optContent').forEach(tab => tab.style.display = 'none');
    const selectedTab = document.getElementById(tabOption);
    if(selectedTab) selectedTab.style.display = 'flex';

    // Verificar si hay pestaña guardada
    const savedTab = localStorage.getItem("pestañaActiva");
    console.log(savedTab);

    // Solo hacer clic en Dashboard si no hay pestaña previa
    if (!savedTab) {
        document.getElementById("defaultTab").click();
    }


    document.querySelectorAll('.sidebar-options').forEach(link => link.classList.remove('active'));
    event.currentTarget.classList.add('active');
    localStorage.setItem("pestañaActiva", tabOption);



    try {
        switch(tabOption) {
            case 'dashboardMain': {
                const moduleDashboard = await import(`resources/js/dashboardAdmin/dashboard.js?${Date.now()}`);
                moduleDashboard.initDashboard();
                break;
            }
            case 'dashboardUsuarios': {
                const moduleUser = await import(`resources/js/dashboardAdmin/usuarios.js?${Date.now()}`);
                moduleUser.initUsuarios();
                break;
            }
            case 'dashboardIngredientes': {
                const moduleIng = await import(`resources/js/dashboardAdmin/ingredientes.js?${Date.now()}`);
                moduleIng.initIngredientes();
                break;
            }
            case 'dashboardProductos': {
                const modulePro = await import(`resources/js/dashboardAdmin/producto.js?${Date.now()}`);
                modulePro.initProductos();
                break;
            }
            case 'dashboardReservas': {
                const moduleRes = await import(`resources/js/dashboardAdmin/reservations.js?${Date.now()}`);
                moduleRes.initReservas();
                break;
            }
            case 'dashboardPedidos': {
                const modulePed = await import(`resources/js/dashboardAdmin/pedidos.js?${Date.now()}`);
                modulePed.initPedidos();
                break;
            }
                
            case 'dashboardReportes': {
                const { initReportes } = await import('resources/js/dashboardAdmin/reportes.js');
                initReportes();
                break;
            }
            case 'dashboardConfiguracion': {
                const moduleConfig = await import(`resources/js/dashboardAdmin/configuracion.js?${Date.now()}`);
                moduleConfig.initConfiguracion();
                break;
            }
        }
    } catch (error) {
        console.error("Error al cargar la sección:", error);
    }
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

                    fetch("app/Functions/dashboardAdmin/usuarios.php?action=addUsers", {
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
                    .catch(error => {
                            console.error(error); 
                            Swal.fire({
                                title: 'Error',
                                text: 'Ocurrió un error al intentar conectarse con el servidor.',
                                icon: 'error'
                            });
                    })
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

                    fetch("app/Functions/dashboardAdmin/ingredientes.php?action=addIngredient", {
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
                    .catch(error => {
                            console.error(error); 
                            Swal.fire({
                                title: 'Error',
                                text: 'Ocurrió un error al intentar conectarse con el servidor.',
                                icon: 'error'
                            });
                    })
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
                    const select = document.getElementById('selectPromotion');
                    const input = document.getElementById('inputPromotion');
                    let promotionValue = select.value;

                    if (promotionValue === 'porcentaje') {
                        // isNaN devuelve true siempre y cuando no sea número
                        if(input.value && !isNaN(input.value)){
                            promotionValue = input.value + '%';
                        } else {
                            promotionValue = 'sinDescuento';
                        }
                    }

                    // Asignar al input antes de crear FormData
                    input.value = promotionValue;
                    const formData = new FormData(formProducts);

                    fetch("app/Functions/dashboardAdmin/productos.php?action=addProduct", {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            windowAddProduct.style.display = "none";
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
                    .catch(error => {
                            console.error(error); 
                            Swal.fire({
                                title: 'Error',
                                text: 'Ocurrió un error al intentar conectarse con el servidor.',
                                icon: 'error'
                            });
                    })
                }
            });

        });
    }
    ////==================| CERRAR SESIÓN |===================

    function cerrarSesion() {
    const btn_cerrarSesion = document.getElementById("logout");
    if (!btn_cerrarSesion) return;

    btn_cerrarSesion.addEventListener("click", () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas cerrar sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cerrar sesión',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: "#d33",
            customClass: { popup: 'swal-custom-font' }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("app/Functions/check.php?action=cerrar", { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                title: '¡Nos vemos!',
                                text: 'Cerraste sesión correctamente.',
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 1500,
                                customClass: { popup: 'swal-custom-font' }
                            }).then(() => {
                                window.location.replace("index.html");
                                localStorage.removeItem("pestañaActiva");
                            });
                        }
                    });
            }
        });
    });
}

async function savedTabF() {
    let savedTab = localStorage.getItem("pestañaActiva");

    // Si aún no hay pestaña guardada, detecta cuál está activa por defecto
    if (!savedTab) {
        const activeLink = document.querySelector(".sidebar-options.active");
        if (activeLink) {
            const onclickValue = activeLink.getAttribute("onclick");
            if (onclickValue) {
                const match = onclickValue.match(/'([^']+)'/);
                if (match) savedTab = match[1];
                localStorage.setItem("pestañaActiva", savedTab);
            }
        }
    }

    const defaultTab = savedTab || "dashboardMain";
    const defaultButton = document.querySelector(`[onclick*="${defaultTab}"]`);
    const defaultSection = document.getElementById(defaultTab);

    // Ocultar todas las secciones
    document.querySelectorAll('.optContent').forEach(tab => {
        tab.style.display = 'none';
    });

    // Mostrar la pestaña guardada o principal
    if (defaultSection) defaultSection.style.display = "flex";
    if (defaultButton) defaultButton.classList.add("active");

    // 👉 Ejecutar la función principal para cargar el módulo JS dinámicamente
    if (defaultButton) {
        const fakeEvent = { preventDefault: () => {}, currentTarget: defaultButton };
        await options(fakeEvent, defaultTab);
    }
}


export { openAddWindow, closeAddWindow, cerrarSesion, savedTabF, initSearches };

// Globalizar la funcion options, para poder usarla en el HTML
window.options = options;
