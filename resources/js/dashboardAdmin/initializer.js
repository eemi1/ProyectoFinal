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

        switch (data.rol) {
            case "1": // Cliente
                window.location.href = "/proyectoFinal/index.html";
                break;

            case "2": // Admin
                console.log("Acceso gerente detectado");
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
                switchPromotionSelect();
                summeryCardProducts();
                changeImage();
                getReservations();
                break;

            case "3": // Mozo
                window.location.href = "/proyectoFinal/app/View/DashboardAdmin/mozoPanel.html";
                break;

            case "4": // Cocinero
                window.location.href = "/proyectoFinal/app/View/DashboardAdmin/cocineroPanel.html";
                break;

            case "5": // Gerente
                window.location.href = "/proyectoFinal/app/View/DashboardAdmin/gerentePanel.html";
                break;
            
            case "6": // Delivery
                window.location.href = "/proyectoFinal/app/View/DashboardAdmin/deliveryPanel.html";
                break;

            default:
                console.warn("Rol no reconocido:", data.rol);
                window.location.href = '/proyectoFinal/index.html';
                break;
        }
    })
    .catch(err => console.error("Error verificando rol:", err));
}
