// /resources/js/Auth/checkRol.js
import { checkRol } from "/resources/js/Auth/checkRol.js";

// /resources/js/dashboardAdmin/util.js
import { cerrarSesion, savedTabF } 
    from "/resources/js/dashboardGerente/util.js";


window.addEventListener("DOMContentLoaded", async () => {

    const rol = await checkRol();

    if (rol !== 5 && rol !== 2) {
        window.location.href = "/index.html";
        console.log("No tienes acceso");
        return;
    }

    accessManager();
});


function accessManager() {
    savedTabF();
    cerrarSesion();
}