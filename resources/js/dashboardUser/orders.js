function getOrders() {
    fetch("/proyectoFinal/app/Functions/dashboardUser/myProfile.php?action=getOrders", {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        const pedidosSection = document.getElementById('pedidos');

        if (!data.success || data.pedidos.length === 0) {
            // Si no hay pedidos, mostrar el contenido por defecto
            pedidosSection.innerHTML = `
                <div class="pedidos-default">
                    <div id="container-default-text">
                        <h1 id="default-title">Historial de Pedidos</h1>
                        <p id="default-subtitle">Aquí podrás ver todos tus pedidos anteriores.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Construir la lista de pedidos
        let html = '';
data.pedidos.forEach(pedido => {
    let estadoPedido = pedido.estado;
    let svgEstado = "";
    let estado = "";

    switch(estadoPedido) {
        case "pendiente":
            svgEstado = `<i class="fa-solid fa-clock fa-lg"></i>`;
            estado = `<span class="statusOrder pendiente">Pendiente</span>`;
            break;
        case "entregado":
            svgEstado = `<i class="fa-solid fa-check fa-lg"></i>`;
            estado = `<span class="statusOrder entregado">Entregado</span>`;
            break;
        case "cancelado":
            svgEstado = `<i class="fa-solid fa-exclamation fa-lg"></i>`;
            estado = `<span class="statusOrder cancelado">Cancelado</span>`;
            break;
        default:
            console.log("Error, no se ha encontrado el estado del pedido.");
            break;
    }

    // Generar HTML de productos sin usar map/join
    let productosHTML = "";
    pedido.productos.forEach(prod => {
        productosHTML += `
            <div class="productoItem">
                <img src="/proyectoFinal/img/${prod.imagen}" alt="${prod.nombre}" width="50">
                <span>${prod.nombre}</span>
                <span>Cantidad: ${prod.cantidad}</span>
                <span>Precio unitario: $${prod.precio_unitario}</span>
                <span>Subtotal: $${prod.subtotal}</span>
            </div>
        `;
    });

    html += `
        <div class="pedidos">
            <div class="header">
                <div class="headerInfo">
                    <div class="productStatus">
                        ${svgEstado}
                    </div>
                    <div class="productInfo">
                        <span><strong>Pedido:</strong> #${pedido.codigo} ${estado}</span>
                        <p>📅 ${pedido.fechaFormateada}</p>
                        <p>📍 ${pedido.direccion.calle}, ${pedido.direccion.numero}, ${pedido.direccion.ciudad}</p>
                    </div>
                </div>
                <div class="headerPrice">
                    <span>$${pedido.total}</span>
                </div>
            </div>
            <hr>
            <div class="content">
                <span>ARTÍCULOS:</span>
                <div class="productosPedido">
                    ${productosHTML}
                </div>
            </div>
        </div>
    `;
});

        pedidosSection.innerHTML = html;
    })
    .catch(err => console.error('Error al obtener pedidos:', err));
}