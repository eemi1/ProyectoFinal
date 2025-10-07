window.addEventListener('DOMContentLoaded', () => {
    checkRol();
});

function checkRol() {
    fetch('/proyectoFinal/app/Functions/check.php?action=verificar', {
        credentials: "same-origin" 
    })
    .then(res => res.json())
    .then(data => {

        if (!data.success || data.rol !== 2) {
            window.location.href = '/proyectoFinal/index.html';
            console.log("No tiene el acceso necesario")
        } else {
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
        }
    })
    .catch(err => console.error(err));
}
