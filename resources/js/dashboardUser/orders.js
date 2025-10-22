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
            let estadoPedido = "";
            estadoPedido = pedido.estado;
            let svgEstado = "";
            let estado = "";
            switch(estadoPedido) {
                case "pendiente":
                    console.log(estadoPedido);
                    svgEstado = `<i class="fa-solid fa-clock fa-lg"></i>`;
                    estado = `<span class="statusOrder pendiente">Pendiente</span>`;

                    break;
                case "entregado":
                    console.log(estadoPedido);
                    svgEstado = `<i class="fa-solid fa-check fa-lg"></i>`;
                    estado = `<span class="statusOrder entregado">Entregado</span>`;
                    break;
                case "cancelado":
                    console.log(estadoPedido);
                    svgEstado = `<i class="fa-solid fa-exclamation fa-lg"></i>`
                    estado = `<span class="statusOrder cancelado">Cancelado</span>`;
                    break;
                default:
                    console.log("Error, no se ha encontrado el estado del pedido.")
                    break;
            }
            html += `
                <div class="pedidos">
                    <div class="header">
                        <div class="headerInfo">
                            <div class="productStatus">
                                ${svgEstado}
                            </div>
                            <div class="productInfo">
                                <span>Pedido: #${pedido.codigo} ${estado}</span>
                                <p>${pedido.fechaFormateada}</p>
                                <p>${pedido.direccion.calle}</p>
                            </div>
                        </div>
                        <div class="headerPrice">
                        
                        </div>
                    </div>

                    <div class="content">

                    </div>
                </div>
            `;
        });

        pedidosSection.innerHTML = html;
    })
    .catch(err => console.error('Error al obtener pedidos:', err));
}