// /resources/js/Auth/checkRol.js
import { checkRol } from "resources/js/Auth/checkRol.js";

// /resources/js/dashboardAdmin/util.js
import { openAddWindow, closeAddWindow, cerrarSesion, initSearches, savedTabF } 
    from "resources/js/dashboardAdmin/util.js";


window.addEventListener("DOMContentLoaded", async () => {

    const rol = await checkRol();

    if (rol !== 2) {
        window.location.href = "index.html";
        return;
    }

    accessAdmin();
});


function accessAdmin() {
    savedTabF();
    openAddWindow();
    closeAddWindow();
    cerrarSesion();


}