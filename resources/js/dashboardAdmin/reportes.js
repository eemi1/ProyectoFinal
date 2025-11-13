// 📄 reportes.js

export function initReportes() {
    console.log("initReportes ejecutado");

    statsCardsReports();
    cardsPorcentageGeneral();
    changeFilter();
}

/*=========================================*/
/*======  STATS CARDS PRINCIPALES  ========*/
/*=========================================*/
function statsCardsReports() {
    fetch('/app/Functions/dashboardAdmin/reportes.php?action=statsCardsReports')
        .then(res => res.json())
        .then(data => {
            const totalIncome = document.getElementById('totalIncome');
            const totalOrders = document.getElementById('totalOrdersReport');
            const totalClients = document.getElementById('totalClients');
            const totalReservations = document.getElementById('totalReservationsReport');

            if (data.success) {
                const valueTotalIncome = parseFloat(data.ventas?.[0]?.total || 0);
                if (totalIncome) totalIncome.textContent = `$ ${valueTotalIncome.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;
                if (totalOrders) totalOrders.textContent = data.pedidos?.[0]?.pedidosTotales || 0;
                if (totalClients) totalClients.textContent = data.clientes?.[0]?.clientesUnicos || 0;
                if (totalReservations) totalReservations.textContent = data.reservas?.[0]?.reservasTotales || 0;
            }
        })
        .catch(err => console.error("Error al cargar las estadísticas generales:", err));
}

/*=========================================*/
/*===== TARJETAS DE PORCENTAJE GENERAL =====*/
/*=========================================*/
function cardsPorcentageGeneral() {
    // Ventas
    fetch('/app/Functions/dashboardAdmin/reportes.php?action=ventas')
        .then(res => res.json())
        .then(data => {
            updatePercentage('incomeChange', data.porcentajeCambio, 'vs ayer');
        })
        .catch(error => console.error("Error en ventas:", error));

    // Pedidos
    fetch('/app/Functions/dashboardAdmin/reportes.php?action=pedidos')
        .then(res => res.json())
        .then(data => {
            renderChart('chartPedidos', 'line', 'Pedidos Totales', data.labels, data.values);
            renderChart('chartPedidosHoy', 'line', 'Precio Total', data.labels2, data.values2);
            renderChart('chartProductFeatured', 'doughnut', 'Productos Destacados', data.labels3, data.values3);
            updatePercentage('ordersChange', data.porcentajeCambio, 'vs ayer');
        })
        .catch(error => console.error("Error en pedidos:", error));

    // Clientes
    fetch('/app/Functions/dashboardAdmin/reportes.php?action=clientes')
        .then(res => res.json())
        .then(data => {
            renderChart('chartClientsMonth', 'bar', 'Clientes x Mes', data.labels2, data.values2);
            renderChart('chartClientsActive', 'line', 'Clientes Activos', data.labels3, data.values3);
            updatePercentage('clientsChange', data.porcentajeCambio, 'vs ayer');
        })
        .catch(error => console.error("Error en clientes:", error));

    // Reservas
    fetch('/app/Functions/dashboardAdmin/reportes.php?action=reservas')
        .then(res => res.json())
        .then(data => {
            renderChart('chartReservationTotal', 'line', 'Reservas Totales', data.labels, data.values);
            renderChart('chartReservationStatus', 'doughnut', 'Estado de Reservas', data.labels2, data.values2);
            updatePercentage('reservationsChange', data.porcentajeCambio, '');
        })
        .catch(error => console.error("Error en reservas:", error));
}

/*=========================================*/
/*===== FUNCIÓN AUXILIAR DE PORCENTAJE =====*/
/*=========================================*/
function updatePercentage(elementId, cambio, textoExtra = '') {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (cambio > 0) {
        el.innerHTML = `(<span style="color: green;">▲ +${cambio}% ${textoExtra}</span>)`;
    } else if (cambio < 0) {
        el.innerHTML = `(<span style="color: red;">▼ ${cambio}% ${textoExtra}</span>)`;
    } else {
        el.innerHTML = `(<span style="color: gray;">= 0% ${textoExtra}</span>)`;
    }
}

/*=========================================*/
/*============ GRAFICADOR CHARTS ===========*/
/*=========================================*/
const charts = {};
function renderChart(canvasId, type, label, labels, values) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (charts[canvasId]) charts[canvasId].destroy();

    charts[canvasId] = new Chart(ctx, {
        type,
        data: {
            labels,
            datasets: [{
                label,
                data: values,
                borderWidth: 2,
                backgroundColor: [
                    '#bbf7d0',
                    '#86efac',
                    '#4ade80',
                    '#22c55e',
                    '#16a34a'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/*=========================================*/
/*========= CAMBIO DE FILTROS RADIO =========*/
/*=========================================*/
function changeFilter() {
    const radios = document.querySelectorAll('.filtersReports input[name="radioReports"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            console.log("Filtro seleccionado:", radio.value);
            // Podés hacer un switch según el tipo de reporte
            switch (radio.value) {
                case 'General':
                    statsCardsReports();
                    cardsPorcentageGeneral();
                    break;
                // otros casos a futuro
            }
        });
    });
}
