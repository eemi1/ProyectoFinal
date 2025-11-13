// dashboard.js
export function initDashboard() {
    console.log("initDashboard ejecutado");
    chartsDashboard();
}



//============================== PESTAÑA DASHBOARD PRINCIPAL ==============================

function chartsDashboard() {
        // === Gráfico de Ventas Semanales ===
    const ctx1 = document.getElementById('ventasChart');

    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [{
          label: 'Ventas ($)',
          data: [250, 320, 280, 400, 500, 650, 580],
          borderColor: '#36A2EB',
                  backgroundColor: [
          '#bbf7d0', // verde menta muy claro
          '#86efac', // verde pastel
          '#4ade80', // verde medio
          '#22c55e', // verde intenso
          '#16a34a'  // verde oscuro suave
        ],
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: '#007bff'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // === Gráfico de Platos Populares ===
    const ctx2 = document.getElementById('platosChart');

    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Pizza', 'Pasta', 'Hamburguesa', 'Ensalada', 'Sushi'],
        datasets: [{
          label: 'Cantidad vendida',
          data: [120, 90, 150, 60, 80],
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
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
}