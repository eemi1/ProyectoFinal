//============================== PESTAÑA DASHBOARD PRODUCTOS ==============================
function deleteProduct() {
    document.querySelectorAll(".delete-product").forEach(item => {
        item.addEventListener("click", function() {
            Swal.fire({
                title: '¿Estás seguro?',
                text: 'Deseas eliminar permanentemente este producto?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: "#d33",
            }).then((result) => {
                if (result.isConfirmed) {
                        const productId = item.dataset.id;
                    fetch("/proyectoFinal/app/Functions/dashboardAdmin/productos.php?action=deleteProduct", {
                        method: "POST",
                        credentials: "same-origin",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId: productId })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            const row = item.closest("tr");
                            if (row) {
                                row.remove();
                            }
                        } else {
                            console.error("Error al eliminar producto:", data.message);
                        }
                    })
                    .catch(error => console.error("Error al eliminar producto:", error));
                }
            })
        });
    });
}



function loadProducts(inputSearchProducts = '') {

    fetch("/proyectoFinal/app/Functions/dashboardAdmin/productos.php?action=showProducts", {
        method: 'POST',
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search: inputSearchProducts })
    })
    .then(res => res.json())
    .then(data => {
        const tableBody = document.querySelector("#table-products tbody");
        if (!data.success) {
            tableBody.innerHTML = `<tr><td colspan="6">${data.message}</td></tr>`;
            return;
        }

        tableBody.innerHTML = ""; // limpiar tabla

        data.data.productos.forEach(producto => {

            let ingredientesList = "";
            producto.ingredientes.forEach(ingrediente => {
                ingredientesList += `<p class="productIngredientsButtonStyle">${ingrediente.nombre}</p>`;
            });

            let productoDestacado = "";
            if (producto.booleanDestacado) {
                productoDestacado = `<i class="fa-solid fa-bookmark" style="color: #f1e205; padding-left: 5px;"></i>`;
            }else{
                productoDestacado = "";
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${producto.id}</td>
                <td id="productsTable-td">
                    <strong>${producto.nombre} ${productoDestacado}</strong>
                    <span>${producto.descripcion}</span>
                </td>
                <td>${producto.categoria}</td>
                <td>${producto.precio} $</td>
                <td class="productIngredientsButton">${ingredientesList}</td>
                <td>${producto.promocion}</td>
                <td id="productTable-td-options">
                    <div>
                        <button class="btnOptions view-product" data-id="${producto.id}"><i class="fa-regular fa-eye fa-lg"></i></button>
                        <button class="btnOptions edit-product" data-id="${producto.id}"><i class="fa-regular fa-pen-to-square fa-lg"></i></button>
                        <button class="btnOptions delete-product" data-id="${producto.id}"><i class="fa-regular fa-trash-can fa-lg" id="productIcon-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        deleteProduct();
        summeryCardProducts();
        viewProduct();
    })
    .catch(err => console.error(err));
}


function filterCategories() {
    const btnFilterCategories = document.querySelectorAll(".btnForms");
    const list = document.querySelector(".container-list-span-categories");

    if (!btnFilterCategories || !list) return;

    btnFilterCategories.forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            list.style.display = (list.style.display === "flex") ? "none" : "flex";
        });
    });
}


function switchPromotionSelect() {

    const promotionSelect = document.getElementById("selectPromotion");
    const inputPromotion = document.getElementById("inputPromotion");

    inputPromotion.disabled = true;
    inputPromotion.value = "";
    inputPromotion.style.backgroundColor = "#e5e7eb";

    promotionSelect.addEventListener("change", function() {
        const valuePromotionSelect = promotionSelect.value; 
        if (valuePromotionSelect === "sinDescuento" || valuePromotionSelect === "2x1") {
            inputPromotion.disabled = true;
            inputPromotion.value = "";
            inputPromotion.style.backgroundColor = "#e5e7eb";
        } else{
            inputPromotion.disabled = false;
            inputPromotion.style.backgroundColor = "#ffffff";
        }


    })

}

function summeryCardProducts() {
    try{
        fetch("/proyectoFinal/app/Functions/dashboardAdmin/productos.php?action=countProducts", {
            method: 'POST',
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const totalProductos = data.totalProductos;
                const cardTotalProductos = document.getElementById("cardSummary-totalProducts");
                cardTotalProductos.textContent = totalProductos;
            } else {
                console.error(data.message);
            }
        })
        .catch(err => console.error(err));
    }catch(err){
        console.error(err);
    }

    try{
        fetch("/proyectoFinal/app/Functions/dashboardAdmin/productos.php?action=countFeatured", {
            method: 'POST',
            credentials: 'same-origin'      
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const totalFavoritos = data.totalFavoritos;
                const cardTotalFavoritos = document.getElementById("cardSummary-totalFeatured");
                cardTotalFavoritos.textContent = totalFavoritos;
            } else {
                console.error(data.message);
            }
        })
        .catch(err => console.error(err));
    }catch(err){
        console.error(err);
    }

    try{
        fetch("/proyectoFinal/app/Functions/dashboardAdmin/productos.php?action=countProducts", {
            method: 'POST',
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const totalProductos = data.totalProductos;
                const cardContent = document.querySelector(".card-summaryProducts-content");
                cardContent.textContent = totalProductos;
            } else {
                console.error(data.message);
            }
        })
        .catch(err => console.error(err));
    }catch(err){
        console.error(err);
    }
}
function viewProduct() {
    const btnViewProduct = document.querySelectorAll(".view-product");
    btnViewProduct.forEach(btn => {
        btn.addEventListener("click", function() {
            const productId = btn.dataset.id;
            
            const modalView = document.getElementById("modalViewProduct");
            modalView.style.display = "flex";
            console.log("Producto ID para ver:", productId);

            fetch("/proyectoFinal/app/Functions/dashboardAdmin/productos.php?action=showProductsModal", {
                method: 'POST',
                credentials: 'same-origin',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: productId })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {


                    console.log("Datos del producto:", data);
                    console.log("Ingredientes del producto:", data.ingredientes);
                    const viewProductName = document.getElementById("modalViewProduct-name");
                    const viewProductDescription = document.getElementById("modalViewProduct-description");
                    const viewProductPrice = document.getElementById("modalViewProduct-price");
                    const viewProductIngredientes = document.getElementById("modalViewProduct-ingredientsList");
                    const viewProductPromotion = document.getElementById("modalViewProduct-promotionValue");
                
                    viewProductName.textContent = data.data.nombre;
                    viewProductDescription.textContent = data.data.descripcion;
                    viewProductPrice.textContent = data.data.precio + " $";
                    let ingredientesList = "";
                    if (data.ingredientes.length === 0) {
                        ingredientesList = `<p>Sin Ingredientes</p>`;
                    } else {
                        data.ingredientes.forEach(ingrediente => {
                            ingredientesList += `<p class="productIngredientsButtonStyle">${ingrediente.nombre}</p>`;
                        });
                    }
                    viewProductIngredientes.innerHTML = ingredientesList;
                    let valorPromocion = "";
                    valorPromocion += "<p class='productPromotionStyle'>" + data.data.valorPromocion + "</p>";
                    viewProductPromotion.innerHTML = valorPromocion;
                } else {
                    console.error(data.message);
                }
            })
            .catch(err => console.error(err));
        });
    }); 
    closeViewProductModal();

}

function closeViewProductModal() {
    const modal = document.getElementById("modalViewProduct");
    const closeBtn = document.getElementById("closeModalViewProduct");
    closeBtn.addEventListener("click", function() {
        modal.style.display = "none";
    });
}

