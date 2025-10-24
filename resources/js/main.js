// =====================
// INICIALIZACIÓN
// =====================
document.addEventListener("DOMContentLoaded", () => {
    // Cargar Header y Footer
    loadHTMLComponent('header', '/proyectoFinal/app/View/Parts/navbar.html')
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
        })
        .catch(err => console.error(err));

    loadHTMLComponent('footer', '/proyectoFinal/app/View/Parts/footer.html');
});

// =====================
// CARGA DE COMPONENTES HTML
// =====================
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
    fetch("/proyectoFinal/app/Functions/check.php?action=verificar")
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

function listenerScroll() {
    let scrollPos = 0;
    const nav = document.querySelector('nav');
    const foryFactoryTitle = document.querySelector('.navbar-title');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > scrollPos) {
            nav.style.height = '60px'
            nav.style.transition = 'height 0.3s ease';
            foryFactoryTitle.style.visibility = 'hidden';
            foryFactoryTitle.style.transition = 'visibility 0.1s ease';
        } else {
            console.log('¡El usuario ha subido!');
            nav.style.height = '80px'
            nav.style.transition = 'height 0.3s ease';
            foryFactoryTitle.style.visibility = 'visible';
            foryFactoryTitle.style.transition = 'visibility 0.1s ease';

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
                fetch("/proyectoFinal/app/Functions/check.php?action=cerrar", { method: 'POST' })
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
                                window.location.replace("/proyectoFinal/index.html");
                            });
                        }
                    });
            }
        });
    });
}

