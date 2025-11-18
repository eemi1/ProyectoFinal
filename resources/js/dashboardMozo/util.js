//============================== CAMBIAR PESTAÑA ==============================
async function options(event, tabOption) {
    
    event.preventDefault();

    if (!event || !event.currentTarget) {
    console.warn("Evento inválido recibido en options()");
}

    // Ocultar todas las secciones
    document.querySelectorAll('.optContent').forEach(tab => {
        tab.style.display = 'none';
    });

    // Mostrar la sección seleccionada
    const selectedTab = document.getElementById(tabOption);
    if (selectedTab) selectedTab.style.display = 'flex';

    // Guardar la pestaña
    localStorage.setItem("pestañaActiva", tabOption);

    // Marcar el radio seleccionado visualmente
    document.querySelectorAll('.filterWaiter .radio').forEach(label => {
        label.classList.remove('active');
    });
    event.currentTarget.closest('.radio').classList.add('active');

    // ===== Cargar módulo dinámico según la pestaña =====
    try {
        switch (tabOption) {
            case 'tomarPedidos': {
                const module = await import(`/resources/js/dashboardMozo/tomarPedidos.js?${Date.now()}`);
                module.initTomarPedidos();
                break;
            }
            case 'estadoPedidos': {
                const module = await import(`/resources/js/dashboardMozo/estadoPedidos.js?${Date.now()}`);
                module.initEstadoPedidos();
                break;
            }
            case 'mesasReservas': {
                const module = await import(`/resources/js/dashboardMozo/estadoMesas.js?${Date.now()}`);
                module.initMesas();
                break;
            }
            case 'cuenta': {
                const module = await import(`/resources/js/dashboardMozo/cuenta.js?${Date.now()}`);
                module.initCuenta();
                break;
            }
        }
    } catch (error) {
        console.error("Error al cargar la sección:", error);
    }
}



//============================== CARGAR PESTAÑA GUARDADA ==============================
async function savedTabF() {

    // Recuperar pestaña almacenada o usar la predeterminada
    let savedTab = localStorage.getItem("pestañaActiva") || "tomarPedidos";

    // Buscar el radio correspondiente
    const defaultButton = document.querySelector(`input[name="radioWaiter"][value="${savedTab}"]`);

    if (defaultButton) {
        defaultButton.checked = true;

        // Simular evento para ejecutar options() correctamente
        const fakeEvent = {
            preventDefault: () => {},
            currentTarget: defaultButton
        };

        // Llamar SOLO a options(), no mostrar nada antes
        await options(fakeEvent, savedTab);
    }
}



//============================== CERRAR SESIÓN ==============================
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
                fetch("/app/Functions/check.php?action=cerrar", { method: 'POST' })
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
                                window.location.replace("/index.html");
                                localStorage.removeItem("pestañaActiva");
                            });
                        }
                    });
            }
        });
    });
}

//============================== EXPORTAR ==============================
export { cerrarSesion, savedTabF };

// Hacer la función global para usarla en el HTML
window.options = options;