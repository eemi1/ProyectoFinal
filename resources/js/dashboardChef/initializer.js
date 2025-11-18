// =============================
// IMPORTS
// =============================
import { checkRol } from "/resources/js/Auth/checkRol.js";
import { initPedidosChef } from "/resources/js/dashboardChef/pedidosChef.js";
import { cerrarSesion, savedTabF } from "/resources/js/dashboardMozo/util.js";
// (Si savedTabF y cerrarSesion están en otro archivo, ajusta la ruta)


// =============================
// VERIFICAR ACCESO
// =============================
window.addEventListener("DOMContentLoaded", async () => {

    const rol = await checkRol();

    if (rol !== 4 && rol !== 2) {
        console.log("No tienes acceso");
        window.location.href = "/index.html";
        return;
    }

    iniciarDashboardChef();
});


// =============================
// INICIO DEL PANEL DEL CHEF
// =============================
function iniciarDashboardChef() {
    // Restaurar pestaña activa si usas sistema de pestañas
    if (typeof savedTabF === "function") {
        savedTabF();
    }

    // Inicializar funciones de cierre de sesión
    if (typeof cerrarSesion === "function") {
        cerrarSesion();
    }

    // Iniciar módulo del chef
    initPedidosChef();
}

