window.addEventListener('DOMContentLoaded', () => {
    checkRol();
});

function checkRol() {
    fetch('/proyectoFinal/app/Functions/check.php?action=verificar', {
        credentials: "same-origin"
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);

        if (!data.success) {
            // No logueado
            window.location.href = '/proyectoFinal/index.html';
            return;
        }
        data.rol = parseInt(data.rol, 10);

        switch (data.rol) {
            case 1: // Cliente
                window.location.href = "/proyectoFinal/index.html";
                break;

            case 2: // Admin
                accessAdmin();
                break;

            case 3: // Mozo
                break;

            case 4: // Cocinero
                break;

            case 5: // Gerente
                break;

            case 6: // Delivery
                break;

            default:
                console.warn("Rol no reconocido:", data.rol);
                window.location.href = '/proyectoFinal/index.html';
                break;
        }
    })
    .catch(err => console.error("Error verificando rol:", err));
}

function accessAdmin() {
    // Verificar si hay pestaña guardada
    const savedTab = localStorage.getItem("pestañaActiva");

    // Solo hacer clic en Dashboard si no hay pestaña previa
    if (!savedTab) {
        document.getElementById("defaultTab").click();
    }
    chartsDashboard();
    loadUsers();
    usersTotal();
    openAddWindow();
    closeAddWindow();
    filterCategories();
    loadIngredients();
    ingredientsTotal();
    initSearches();
    showModalProductsAddIngredients();
    switchPromotionSelect();
    summeryCardProducts();
    changeImage();
    getReservations();
    showTablesAvailables();
    getOrders();
    changeFilter();
    statsCardsReports();
    cardsPorcentageGeneral();
}