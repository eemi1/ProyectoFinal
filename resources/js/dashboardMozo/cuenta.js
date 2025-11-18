export function initCuenta() {
    cargarMesasOcupadas();

    document.getElementById("cuentaMesaSelect").addEventListener("change", () => {
        const mesa = document.getElementById("cuentaMesaSelect").value;
        if (mesa) cargarCuentaMesa(mesa);
    });
}

/* ==========================
   1. Cargar mesas con pedido
========================== */
function cargarMesasOcupadas() {

    fetch("/app/Functions/dashboardMozo/getTablesBill.php")
        .then(r => r.json())
        .then(data => {

            const select = document.getElementById("cuentaMesaSelect");

            if (!data.success || data.mesas.length === 0) {
                select.innerHTML = `<option value="">No hay mesas con pedidos activos</option>`;
                return;
            }

            select.innerHTML = `<option value="">Seleccionar una mesa...</option>`;

            data.mesas.forEach(m => {
                select.innerHTML += `<option value="${m.id_mesa}">Mesa ${m.id_mesa}</option>`;
            });
        });
}

/* ==========================
   2. Cargar detalles del pedido
========================== */
function cargarCuentaMesa(mesa) {

    fetch(`/app/Functions/dashboardMozo/getBill.php?mesa=${mesa}`)
        .then(r => r.json())
        .then(data => {

            if (!data.success) {
                Swal.fire("Error", data.message, "error");
                return;
            }

            document.getElementById("cuentaDetalles").style.display = "block";

            // Items
            const cont = document.getElementById("cuentaItems");
            cont.innerHTML = "";

            data.detalles.forEach(item => {
                cont.innerHTML += `
                    <div class="itemPedido">
                        <span>${item.nombre_producto} x${item.cantidad}</span>
                        <span>$${Number(item.subtotal).toFixed(2)}</span>
                    </div>
                `;
            });

            // Totales calculados
            const subtotal = Number(data.subtotal);
            const descuento = Number(data.descuento);
            const propina = Number(data.propina);
            const total = Number(data.total);

            document.getElementById("cuentaSubtotal").innerText = "$" + subtotal.toFixed(2);
            document.getElementById("cuentaDescuento").innerText = "$" + descuento.toFixed(2);
            document.getElementById("cuentaPropina").innerText = "$" + propina.toFixed(2);
            document.getElementById("cuentaTotalFinal").innerText = "$" + total.toFixed(2);

            // Guardar IDs para cierre
            window.facturaActual = data.id_factura;
            window.mesaActual = mesa;
        })
        .catch(err => {
            console.error(err);
            Swal.fire("Error", "No se pudo cargar la cuenta.", "error");
        });
}

/* ==========================
   3. Confirmar Pago
========================== */
window.confirmarPagoCuenta = function () {

    const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;

    fetch("/app/Functions/dashboardMozo/confirmPay.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_factura: window.facturaActual,
            mesa: window.mesaActual,
            metodoPago
        })
    })
        .then(r => r.json())
        .then(data => {

            if (data.success) {
                Swal.fire("Cuenta cerrada", "Pago registrado y mesa liberada.", "success");
                cargarMesasOcupadas();
                document.getElementById("cuentaDetalles").style.display = "none";
            } else {
                Swal.fire("Error", data.message, "error");
            }
        });
};
