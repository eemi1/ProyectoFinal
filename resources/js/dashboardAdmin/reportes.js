document.addEventListener('DOMContentLoaded', () => {
});

function changeFilter() {
    const selectedFilter = document.querySelectorAll('.filtersReports radio[name=radioReports]');
    console.log(selectedFilter);

    selectedFilter.forEach(select => {
        switch(select){
            case 'General':

        }
    })
}

function statsCardsReports() {
    fetch('/proyectoFinal/app/Functions/dashboardAdmin/reportes.php?action=statsCardsReports')
        .then(res => res.json())
        .then(data =>{
            const totalIncome = document.getElementById('totalIncome');
            const totalOrders = document.getElementById('totalOrdersReport');
            const totalClients = document.getElementById('totalClients');
            const totalReservations = document.getElementById('totalReservationsReport');

            if(data.success){
                let valueTotalIncome = parseFloat(data.ventas[0].total);
                if (totalIncome) {totalIncome.textContent = `$ ${valueTotalIncome.toLocaleString("es-ES", {minimumFractionDigits: 2 })}`;}
                if (totalOrders) {totalOrders.textContent = `${data.pedidos[0].pedidosTotales}`}
                if (totalClients) {totalClients.textContent = `${data.clientes[0].clientesUnicos}`}
                if (totalReservations) {totalReservations.textContent = `${data.reservas[0].reservasTotales}`}
            }
        })
}

function cardsPorcentageGeneral() {
        // Porcentaje de ventas
        try{
            fetch('/proyectoFinal/app/Functions/dashboardAdmin/reportes.php?action=ventas')
            .then(res => res.json())
            .then(data => {
                // renderChart('chartVentas', 'line', 'Ventas Diarias', data.labels, data.values);

                let totalChange = document.getElementById('incomeChange'); 
                if (totalChange) {
                    const cambio = data.porcentajeCambio;
                    if (cambio > 0) {
                        totalChange.innerHTML = `(<span style="color: green;">▲ +${cambio}% vs ayer</span>)`;
                    } else if (cambio < 0) {
                        totalChange.innerHTML = `(<span style="color: red;">▼ ${cambio}% vs ayer</span>)`;
                    } else {
                        totalChange.innerHTML = `(<span style="color: gray;">= 0% vs ayer</span>)`;
                    }
                }
            })
            .catch(error => console.error("Error:", error));
        }catch(e){
            console.log('Error al cargar el porcentaje de las ventas', $e)
        }


        //Porcentaje de pedidos
        try{
            fetch('/proyectoFinal/app/Functions/dashboardAdmin/reportes.php?action=pedidos')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                renderChart('chartPedidos', 'line', 'Pedidos totales', data.labels, data.values);
                renderChart('chartPedidosHoy', 'line', 'Precio total', data.labels2, data.values2);
                renderChart('chartProductFeatured', 'doughnut', 'Precio total', data.labels3, data.values3);

                let totalChange = document.getElementById('ordersChange'); 
                if (totalChange) {
                    const cambio = data.porcentajeCambio;
                    if (cambio > 0) {
                        totalChange.innerHTML = `(<span style="color: green;">▲ +${cambio}% vs ayer</span>)`;
                    } else if (cambio < 0) {
                        totalChange.innerHTML = `(<span style="color: red;">▼ ${cambio}% vs ayer</span>)`;
                    } else {
                        totalChange.innerHTML = `(<span style="color: gray;">= 0% vs ayer</span>)`;
                    }
                }
            })
            .catch(error => console.error("Error al cargar el porcentaje de pedidos", error))
        }catch(e){
            console.log('Error al cargar el porcentaje de los pedidos', $e);
        }

        //Porcentaje de Clientes Unicos
        try{
            fetch('/proyectoFinal/app/Functions/dashboardAdmin/reportes.php?action=clientes')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                // renderChart('chartPedidos', 'line', 'Ventas Diarias', data.labels, data.values);

                let totalChange = document.getElementById('clientsChange'); 
                if (totalChange) {
                    const cambio = data.porcentajeCambio;
                    if (cambio > 0) {
                        totalChange.innerHTML = `(<span style="color: green;">▲ +${cambio}% vs ayer</span>)`;
                    } else if (cambio < 0) {
                        totalChange.innerHTML = `(<span style="color: red;">▼ ${cambio}% vs ayer</span>)`;
                    } else {
                        totalChange.innerHTML = `(<span style="color: gray;">= 0% vs ayer</span>)`;
                    }
                }
            })
            .catch(error => console.error("Error al cargar el porcentaje de pedidos", error))

        }catch(e){
            console.log('Error al cargar el porcentaje de los clientes', $e);
        }

        //Porcentaje de Clientes Unicos
        try{
            fetch('/proyectoFinal/app/Functions/dashboardAdmin/reportes.php?action=reservas')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                // renderChart('chartPedidos', 'line', 'Ventas Diarias', data.labels, data.values);

                let totalChange = document.getElementById('reservationsChange'); 
                if (totalChange) {
                    const cambio = data.porcentajeCambio;
                    if (cambio > 0) {
                        totalChange.innerHTML = `(<span style="color: green;">▲ +${cambio}%</span>)`;
                    } else if (cambio < 0) {
                        totalChange.innerHTML = `(<span style="color: red;">▼ ${cambio}%</span>)`;
                    } else {
                        totalChange.innerHTML = `(<span style="color: gray;">= 0%</span>)`;
                    }
                }
            })
            .catch(error => console.error("Error al cargar el porcentaje de pedidos", error))
        }catch(e){
            console.log('Error al cargar el porcentaje de los clientes', $e);
        }
}


function 




const charts = {};
function renderChart(canvasId, type, label, labels, values) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    charts[canvasId]  = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                borderWidth: 2,
        backgroundColor: [
          '#bbf7d0', // verde menta muy claro
          '#86efac', // verde pastel
          '#4ade80', // verde medio
          '#22c55e', // verde intenso
          '#16a34a'  // verde oscuro suave
        ],

            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
                y: { beginAtZero: true }
        }
    });
}

