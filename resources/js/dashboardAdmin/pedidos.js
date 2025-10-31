
document.addEventListener('DOMContentLoaded', () => {
    changeFilter();
})
/*=========================================*/
/*====== FILTROS RESERVAS Y MESAS =========*/
/*=========================================*/

function changeFilter() {
    /*====== FILTROS PARA VER PEDIDOS =========*/
    document.querySelectorAll('.filterStatus input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const estado = radio.value;
            getOrders(estado);
            console.log(estado);
        });
    });

    document.getElementById('searchReservationsInput').addEventListener('input', (e) => {
        const filtro = e.target.value.toLowerCase();
        const pedidos = document.querySelectorAll('.reservaItem');

        pedidos.forEach(pedido => {
            const texto = pedido.textContent.toLowerCase();

            if (texto.includes(filtro)) {
                pedido.style.display = '';
            } else {
                pedido.style.display = 'none';
            }
        });
    });

    document.getElementById('clearFiltersOrders').addEventListener('click', () => {
        document.getElementById('searchReservationsInput').value = '';
        getOrders();
    });
}
/*===================================*/
/*===== VER RESERVAS PENDIENTES =====*/
/*===================================*/

function getOrders(estado = 'todas') {
    fetch(`/proyectoFinal/app/Functions/dashboardAdmin/pedidos.php?action=getProducts&estado=${estado}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ estado: estado })
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('reservasContainer').innerHTML = data;
        })
        .catch(error => console.error('Error fetching orders:', error));
}