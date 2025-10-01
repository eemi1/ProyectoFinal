//============================== PESTAÑA DASHBOARD INGREDIENTES ==============================
function loadIngredients(inputSearchIngredients = '') {

    fetch("/proyectoFinal/app/Functions/dashboardAdmin/ingredientes.php?action=showIngredients", {
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
            row.innerHTML = `
                <td id="ingredientsTable-td">
                    <strong>${ingrediente.nombre}</strong>
                    <span>${ingrediente.descripcion}</span>
                </td>
                <td>${ingrediente.unidad}</td>
                <td>${ingrediente.stock_actual}</td>
                <td>${ingrediente.stock_minimo}</td>
                <td>${ingrediente.proveedor}</td>
                <td>off</td>
                <td>off</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(err => console.error(err));
}

function ingredientsTotal() {
    fetch("/proyectoFinal/app/Functions/dashboardAdmin/ingredientes.php?action=ingredientsAmount", {
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
        fetch("/proyectoFinal/app/Functions/dashboardAdmin/ingredientes.php?action=showIngredients", {
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
                        <span>${ingrediente.descricpcion}</span>
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