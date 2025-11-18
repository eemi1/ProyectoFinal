// ===============================
// INIT
// ===============================
export function initMesas() {
    showTablesAvailables();
}



// ===============================
// MOSTRAR MESAS
// ===============================
export function showTablesAvailables() {

    const reservasSection = document.getElementById('mesasReservas');
    reservasSection.innerHTML = ""; // limpiar antes de pintar



    fetch(`/app/Functions/dashboardMozo/getTables.php`)
        .then(res => res.json())
        .then(data => {

            if (!data.success) return;

            // Título
            const header = document.createElement('h2');
            header.textContent = "Estado de Mesas";
            header.classList.add("headerMesas");
            reservasSection.appendChild(header);


            // ===============================
            // FILTROS
            // ===============================
            const filterShowTables = document.createElement('div');
            filterShowTables.classList.add('filterShowTables');
            filterShowTables.innerHTML = `
                <select class="filterTables" id="filterAvailability">
                    <option value="todas">Todas las mesas</option>
                    <option value="disponible">Disponibles</option>
                    <option value="ocupada">Ocupadas</option>
                    <option value="reservada">Reservadas</option>
                </select>

                <select class="filterTables" id="filterCapacity">
                    <option value="todas">Todas las capacidades</option>
                    <option value="2">Capacidad 2</option>
                    <option value="4">Capacidad 4</option>
                    <option value="6">Capacidad 6</option>
                    <option value="8">Capacidad 8</option>
                </select>

                <button id="clearFiltersShowTables" class="clearFilters">
                    Limpiar filtros
                </button>
            `;

            reservasSection.appendChild(filterShowTables);


            // ===============================
            // CONTENEDOR DE MESAS
            // ===============================
            const tablesContainer = document.createElement('div');
            tablesContainer.classList.add('tables-container');
            reservasSection.appendChild(tablesContainer);


            // Guardar mesas originales para filtrar
            window._mesasOriginales = data.mesas;
            renderMesas(data.mesas);


            // ===============================
            // EVENTOS DE FILTRO
            // ===============================
            document.getElementById("filterAvailability").addEventListener("change", aplicarFiltros);
            document.getElementById("filterCapacity").addEventListener("change", aplicarFiltros);

            document.getElementById("clearFiltersShowTables").addEventListener("click", () => {
                document.getElementById("filterAvailability").value = "todas";
                document.getElementById("filterCapacity").value = "todas";
                renderMesas(window._mesasOriginales);
            });

        })
        .catch(err => {
            console.error("Error obteniendo mesas:", err);
        });
}



// ===============================
// RENDERIZAR MESAS
// ===============================
function renderMesas(lista) {
    const cont = document.querySelector(".tables-container");
    cont.innerHTML = "";

    lista.forEach(table => {
        const tableDiv = document.createElement('div');
        tableDiv.classList.add('tableItem');

        tableDiv.classList.add(
            table.estado === "disponible" ? "mesa-disponible" :
            table.estado === "ocupada" ? "mesa-ocupada" :
            table.estado === "reservada" ? "mesa-reservada" : "mesa-desconocida"
        );

        tableDiv.innerHTML = `
            <h3>Mesa #${table.numero}</h3>
            <p><strong>Capacidad:</strong> ${table.capacidad}</p>
            <p><strong>Estado:</strong> ${table.estado}</p>
        `;

        cont.appendChild(tableDiv);
    });
}



// ===============================
// APLICAR FILTROS
// ===============================
function aplicarFiltros() {
    const estado = document.getElementById("filterAvailability").value;
    const capacidad = document.getElementById("filterCapacity").value;

    let filtradas = window._mesasOriginales;

    if (estado !== "todas") {
        filtradas = filtradas.filter(m => m.estado === estado);
    }

    if (capacidad !== "todas") {
        filtradas = filtradas.filter(m => m.capacidad == capacidad);
    }

    renderMesas(filtradas);
}
