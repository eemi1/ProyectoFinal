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
    switchPromotionSelect();
    summeryCardProducts();
    changeImage();
});