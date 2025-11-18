// /resources/js/Auth/checkRol.js
import { checkRol } from "/resources/js/Auth/checkRol.js";

// /resources/js/dashboardAdmin/util.js

import { cerrarSesion, savedTabF } 
    from "/resources/js/dashboardMozo/util.js";


window.addEventListener("DOMContentLoaded", async () => {

    const rol = await checkRol();

    if (rol !== 3 && rol !==2) {
        window.location.href = "/index.html";
        return;
    }

    accessWaiter();
});


function accessWaiter() {
    savedTabF();
    cerrarSesion();
}