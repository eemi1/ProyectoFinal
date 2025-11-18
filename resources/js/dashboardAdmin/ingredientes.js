// ingredientes.js
export function initIngredientes() {
    console.log("initIngredientes ejecutado");
    loadIngredients();
    ingredientsTotal();
    getIngredients();
    showModalProductsAddIngredients();
    initSearchIngredientes();
}

//============================== PESTAÑA DASHBOARD INGREDIENTES ==============================
function loadIngredients(inputSearchIngredients = '') {

    fetch("/app/Functions/dashboardAdmin/ingredientes.php?action=showIngredients", {
        method: 'POST',
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: inputSearchIngredients })
    })
    .then(res => res.json())
    .then(data => {
        const tableBody = document.querySelector("#table-ingredients tbody");

        if (!data.success) {
            tableBody.innerHTML = `<tr><td colspan="6">${data.message}</td></tr>`;
            return;
        }

        tableBody.innerHTML = ""; // limpiar tabla

        data.data.ingredientes.forEach(ingrediente => {
            const row = document.createElement("tr");

            // Estado de los ingredientes
            let estadoStock = '';
                switch (ingrediente.estado_stock) {
                    case 'agotado':
                        estadoStock = '<span style="background-color:red;font-weight:bold;">Agotado</span>';
                        stockActual = `<span style="color:darkred;font-weight:bold;">${ingrediente.stock_actual}</span>`;
                        break;
                    case 'bajo':
                        estadoStock = '<span style="background-color:orange;">Bajo</span>';
                        stockActual = `<span style="color:orange;font-weight:bold;">${ingrediente.stock_actual}</span>`;
                        break;
                    case 'normal':
                        estadoStock = '<span style="background-color:green;">Normal</span>';
                        break;
            }

            row.innerHTML = `
                <td id="ingredientsTable-td">
                    <strong>${ingrediente.nombre}</strong>
                    <span>${ingrediente.descripcion}</span>
                </td>
                <td>${ingrediente.unidad}</td>
                <td>${ingrediente.stock_actual || stockActual}</td>
                <td>${ingrediente.stock_minimo}</td>
                <td>${ingrediente.proveedor}</td>
                <td id="ingredientsTable-estadoStock">${estadoStock}</td>
                <td>off</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(err => console.error(err));
}
function initSearchIngredientes() {
    const inputSearchIngredients = document.getElementById("searchInputIngredients");
    if (!inputSearchIngredients) return;

    inputSearchIngredients.addEventListener("input", () => {
        loadIngredients(inputSearchIngredients.value);
    });

    loadIngredients();
}
function ingredientsTotal() {
    fetch("/app/Functions/dashboardAdmin/ingredientes.php?action=ingredientsAmount", {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById("totalIngredientsNumber").textContent = `(${data.totalIngredientes})`;
        }
    })
    .catch(error => console.error("Error al obtener total de ingredientes:", error));
}

function getIngredients(){
        fetch("/app/Functions/dashboardAdmin/ingredientes.php?action=showIngredients", {
        method: "GET",
        credentials: "same-origin"
    })
    .then(res => res.json())
    .then(data => {
        const ingredientInfo = document.querySelector("#productModal-addIngredint-checkboxs");
        if (!data.success) {
            ingredientInfo.innerHTML = `<tr><td colspan="6">${data.message}</td></tr>`;
            return;
        }

        ingredientInfo.innerHTML = ""; 

        data.data.ingredientes.forEach(ingrediente => {
            ingredientInfo.innerHTML += `

            <div class="productModal-addIngredient-checkboxcontainer">
                <label>
                    <input type="checkbox" name="productIngrediente[]" value="${ingrediente.id}">
                    <div class="ingredient-info">
                        <strong>${ingrediente.nombre}</strong>
                        <span>${ingrediente.descripcion}</span>
                        <p>Stock ${ingrediente.stock_actual}${ingrediente.unidad} | </p>
                    </div>
                    <input type="number" name="cantidadIngrediente[${ingrediente.id}]" placeholder="Cantidad (g)" min="0" step="0.01" style="width: 100px;">
                </label>
            </div>
            `;
        });
    })
}
function showModalProductsAddIngredients(){

    const btnIngredients = document.getElementById("productModal-inputSearchSelectIngredients")
    const checkboxIngredientsList = document.getElementById("productModal-addIngredients-container")

    checkboxIngredientsList.style.display="none"

    if(!btnIngredients || !checkboxIngredientsList) return;



    btnIngredients.addEventListener("click", function(e) {
        e.preventDefault();
        if(checkboxIngredientsList.style.display === "flex") {
            checkboxIngredientsList.style.display="none";
            return;
        }   
        checkboxIngredientsList.style.display="flex";
        getIngredients();

    })
}

export async function abrirMerma() {

    const res = await fetch('/app/Functions/dashboardAdmin/ingredientes.php?action=showIngredients');
    const data = await res.json();

    if (!data.success || !data.data || !data.data.ingredientes) {
        return Swal.fire("Sin ingredientes", "No hay ingredientes disponibles para registrar merma.", "warning");
    }

    let opciones = "";
    data.data.ingredientes.forEach(ing => {
        opciones += `
            <option value="${ing.id}">
                ${ing.nombre} (Stock: ${ing.stock_actual})
            </option>
        `;
    });

    const { value: formValues } = await Swal.fire({
        title: "Registrar Merma",
        html: `
            <div style="text-align:left;">
                <label><b>Ingrediente</b></label>
                <select id="swalIngrediente" class="swal2-input">${opciones}</select>

                <label><b>Cantidad perdida</b></label>
                <input type="number" id="swalCantidad" class="swal2-input" step="0.01" min="0">

                <label><b>Motivo</b></label>
                <input type="text" id="swalMotivo" class="swal2-input">

                <label><b>Fecha</b></label>
                <input type="date" id="swalFecha" class="swal2-input">
            </div>
        `,
        focusConfirm: false,
        confirmButtonText: "Registrar",
        showCancelButton: true,
        preConfirm: () => {
            const ingrediente = document.getElementById("swalIngrediente").value;
            const cantidad = document.getElementById("swalCantidad").value;
            const motivo = document.getElementById("swalMotivo").value;
            const fecha = document.getElementById("swalFecha").value;

            if (!ingrediente || !cantidad || !motivo || !fecha) {
                Swal.showValidationMessage("Todos los campos son obligatorios");
                return false;
            }

            return { ingrediente, cantidad, motivo, fecha };
        }
    });

    if (!formValues) return;

    const formData = new FormData();
    formData.append("ingrediente_id", formValues.ingrediente);
    formData.append("cantidad", formValues.cantidad);
    formData.append("motivo", formValues.motivo);
    formData.append("fecha", formValues.fecha);

    const res2 = await fetch('/app/Functions/dashboardAdmin/ingredientes.php?action=registrarMerma', {
        method: "POST",
        body: formData
    });
    const result = await res2.json();

    if (result.success) {
        Swal.fire("¡Merma registrada!", "El stock fue actualizado correctamente.", "success");
        loadIngredients();
    } else {
        Swal.fire("Error", result.message, "error");
    }
}
