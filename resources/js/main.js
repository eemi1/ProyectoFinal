// =====================
// INICIALIZACIÓN
// =====================
document.addEventListener("DOMContentLoaded", () => {
    // Cargar Header y Footer
    loadHTMLComponent('header', '/app/View/Parts/navbar.html')
        .then(() => {
            // Inicializar funciones del header solo después de cargarlo
            navLoggeado();
            menuProfile();
            cerrarSesion();
            viewCart();
            renderCartFromLocalStorage(); // Renderiza carrito desde localStorage
            addProductsToCart();
            checkout();
            listenerScroll();

            // Renderizar nuevamente el logo y titulo del nav cada 15 segundos
            loadGlobalConfiguration();
            setInterval(loadGlobalConfiguration, 15000);
        })
        .catch(err => console.error(err));

    loadHTMLComponent('footer', '/app/View/Parts/footer.html');
});

// ===================================================
// CARGAR CONFIGURACIÓN GLOBAL DEL RESTAURANTE
// ===================================================

async function loadGlobalConfiguration() {
    try {
        // GET: Obtener los datos de la configuración predeterminada de la página.
        const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=getConfigurationRestaurant');
        const data = await res.json();
        console.log("GET Global Configuration", data);

        
        // Validación
        if (!data || !data.configuration) {
            console.warn("Configuración no encontrada o inválida:", data);
            return;
        }

        //Actualizar Título y Logo del NAV
        try{
            document.querySelector('.navbar-logo').src = '/uploads/logo/logo.jpg?' + new Date().getTime();;
            document.querySelector('.navbar-title').textContent = data.configuration.nombre;
        }catch(error){
            console.log("Error al obtener la configuración global del Nav.");
        }
        
        // Actualizar descripción (index.html)
        try{
            document.querySelector('.page1-description').textContent = data.configuration.descripcion;
        }catch(error){
            console.log("Error al actualizar la descripción del index.")
        }

        try{
            // Teléfono
            document.getElementById('footerPhone').textContent = data.configuration.telefono;
            // Dirección
            document.getElementById('footerLocation').textContent = data.configuration.direccion;
            // Email
            document.getElementById('footerEmail').textContent = data.configuration.email;
        }catch(error){
            console.log("Error al al obtener la configuración global del footer.")
        }
    }catch(error){
        console.log('Error al cargar la Configuración Global.', error)
    }
}

// =============================
// CARGA DE COMPONENTES HTML
// =============================
function loadHTMLComponent(selector, url) {
    return fetch(url)
        .then(response => response.text())
        .then(data => {
            document.querySelector(selector).innerHTML = data;
        })
        .catch(err => console.error(`Error cargando ${url}:`, err));
}

// =====================
// GESTIÓN DE SESIÓN
// =====================
function navLoggeado() {
    fetch("/app/Functions/check.php?action=verificar")
        .then(res => res.json())
        .then(data => {
            const guestBtns = document.querySelector(".navbar-buttons");
            const loggedBtns = document.querySelector(".navbar-buttons-logged");
            if (!guestBtns || !loggedBtns) return;

            if (data.success) {
                guestBtns.style.display = "none";
                loggedBtns.style.display = "flex";

                const nameEl = document.getElementById("nameNavLogged");
                const emailEl = document.getElementById("emailNavLogged");
                if (nameEl) nameEl.textContent = data.usuario;
                if (emailEl) emailEl.textContent = data.email;
            } else {
                guestBtns.style.display = "flex";
                loggedBtns.style.display = "none";
            }
        })
        .catch(error => console.error("Error al verificar sesión:", error));
}
// =====================
// ANIMACIÓN AL BAJAR NAV
// =====================
function listenerScroll() {
    let scrollPos = 0;
    const nav = document.querySelector('nav');
    const foryFactoryTitle = document.querySelector('.navbar-title');
    if (!nav || !foryFactoryTitle) return;

    nav.style.transition = 'height 0.3s ease';
    foryFactoryTitle.style.transition = 'opacity 0.3s ease';

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > scrollPos) {
            // Scrollea hacia abajo
            nav.style.height = '60px';
            foryFactoryTitle.style.opacity = '0';
        } else {
            // Scrollea hacia arriba
            console.log('¡El usuario ha subido!');
            nav.style.height = '80px';
            foryFactoryTitle.style.opacity = '1';
        }

        scrollPos = currentScroll;
    });
}

function menuProfile() {
    const profile = document.getElementById('icon-profile-nav');
    const ddMenu = document.getElementById('dropdownMenu');
    if (!profile || !ddMenu) return;

    profile.addEventListener('click', () => {
        ddMenu.style.display = ddMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    document.addEventListener('click', (e) => {
        if (!profile.contains(e.target) && !ddMenu.contains(e.target)) {
            ddMenu.style.display = 'none';
        }
    });
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
                            });
                        }
                    });
            }
        });
    });
}

