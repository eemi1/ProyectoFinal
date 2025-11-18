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
                const module = await import(`/resources/js/dashboardGerente/reservas.js?${Date.now()}`);
                Object.assign(window, module);
                module.initReservas();

                const module2 = await import(`/resources/js/dashboardGerente/pedidos.js?${Date.now()}`);
                Object.assign(window, module2);
                module2.initPedidos(true);
                break;
            }
            case 'dashboardReservas': {
                const module = await import(`/resources/js/dashboardGerente/reservas.js?${Date.now()}`);
                Object.assign(window, module);
                module.initReservas();
                break;
            }
            case 'dashboardPedidos': {
                const module = await import(`/resources/js/dashboardGerente/pedidos.js?${Date.now()}`);
                Object.assign(window, module);
                module.initPedidos();
                break;
            }
        }
    } catch (error) {
        console.error("Error al cargar la sección:", error);
    }
}

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

export { cerrarSesion, savedTabF };

// Globalizar la funcion options, para poder usarla en el HTML
window.options = options;