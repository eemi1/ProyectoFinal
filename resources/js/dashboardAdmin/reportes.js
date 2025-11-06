document.addEventListener('DOMContentLoaded', () => {
});

function statsCardsReports() {
    fetch('/proyectoFinal/app/Functions/dashboardAdmin/reportes.php?action=statsCardsReports')
        .then(res => res.json())
        .then(data =>{
            const totalIncome = document.getElementById('totalIncome');
            const totalOrders = document.getElementById('totalOrdersReport');
            const totalClients = document.getElementById('totalClients');
            const totalReservations = document.getElementById('totalReservationsReport');

            if(data.success){
                if (totalIncome) {totalIncome.textContent = `${data.ventas[0].total}`;}
                if (totalOrders) {totalOrders.textContent = `${data.pedidos[0].pedidosTotales}`}
                if (totalClients) {totalClients.textContent = `${data.clientes[0].clientesUnicos}`}
                if (totalReservations) {totalReservations.textContent = `${data.reservas[0].reservasTotales}`}
                // console.log(`reservas: ${data.reservas[0].reservasTotales}`);
            }
        })
}

function percentage() {
        // Porcentaje de ventas
        try{
            fetch('/proyectoFinal/app/Functions/dashboardAdmin/reportes.php?action=ventas')
            .then(res => res.json())
            .then(data => {
                renderChart('chartVentas', 'line', 'Ventas Diarias', data.labels, data.values);
                let totalChange = document.getElementById('incomeChange'); 

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
                renderChart('chartPedidos', 'line', 'Ventas Diarias', data.labels, data.values);
                let totalChange = document.getElementById('incomeChange'); 
                
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
            console.log('Error al cargar el porcentaje de los pedidos', $e)
        }

}







let currentChart = null;
function renderChart(canvasId, type, label, labels, values) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (currentChart) {
        currentChart.destroy();
    }

    currentChart  = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
                y: { beginAtZero: true }
        }
    });
}

