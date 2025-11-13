window.addEventListener('DOMContentLoaded', () => {
    loadAndRenderProducts();

});


function loadAndRenderProducts() {
    fetch('app/Functions/products/indexProducts.php?action=showProducts')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                console.error('Error al cargar productos:', data.message);
                return;
            }

            data.data.productos.forEach(product => {
                const card = document.createElement("div");
                card.className = "product-card";

                const imgSrc = `uploads/products/${product.id}.jpg`;
                const svgCarrito = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>`;

                let promocionHTML = "";
                const tipoPromocion = product.tipoPromocion;
                const valorPromocion = product.valorPromocion;
                            
                if (tipoPromocion === '2x1') {
                    promocionHTML = `<span class="badge-promocion">2x1</span>`;
                } else if (tipoPromocion === 'porcentaje' && valorPromocion > 0) {
                    // Convertimos el valor a porcentaje para mostrarlo
                    const porcentaje = valorPromocion * 100;
                    promocionHTML = `<span class="badge-promocion">${porcentaje.toFixed(0)}% OFF</span>`;
                } else {
                    promocionHTML = ""; // Sin promoción
                }

                card.innerHTML = `
                    <img src="${imgSrc}" alt="${product.nombre}" onerror="this.onerror=null;this.src='uploads/products/imagen-default.png';">
                    <div class="product-header">
                        <h3>${product.nombre} ${promocionHTML}</h3>
                        <p>${product.descripcion}</p>
                    </div>
                    <div class="product-info">
                            <p><i class="fa-regular fa-clock"></i>${product.tiempoPreparacion}</p>
                            <span>${product.precio}</span>
                    </div>
                    <button class="agregarCarrito" 
                            data-nombre="${product.nombre}"
                            data-nombre="${product.descripcion}"
                            data-id="${product.id}" 
                            data-precio="${product.precio}" 
                            data-promocion="${product.promocion}" 
                            data-tipo-promocion="${product.tipoPromocion}" 
                            data-valor-promocion="${product.valorPromocion}">
                        ${svgCarrito} Agregar al carrito
                    </button>         
                `;

                const category = product.categoria.toLowerCase();
                let container = null;

                if (category.includes("carne")) container = document.querySelector("#beef-page .products-grid");
                else if (category.includes("vegetariana")) container = document.querySelector("#vegetarian-page .products-grid");
                else if (category.includes("vegana")) container = document.querySelector("#vegan-page .products-grid");
                else if (category.includes("acompañamiento")) container = document.querySelector("#accompaniment-page .products-grid");
                else if (category.includes("bebida")) container = document.querySelector("#drink-page .products-grid");
                else if (category.includes("postre")) container = document.querySelector("#dessert-page .products-grid");
                else if (category.includes("combo")) container = document.querySelector("#combo-page .products-grid");

                if (container) container.appendChild(card);
            });
            addProductsToCart();
        })
        .catch(err => console.error('Error de conexión:', err));
}
