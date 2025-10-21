    
document.addEventListener("DOMContentLoaded", () => {
    loadAddresses();
})
    
function loadAddresses() {
    const addressesContainer = document.getElementById("contentAddress");
        fetch("/proyectoFinal/app/Functions/dashboardUser/addressController.php?action=get", {
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            addressesContainer.innerHTML = "";

            if(data.success) {
                
                data.direcciones.forEach(dir => {
                    if (dir.activo === 1 || dir.activo === "1"){
                        valorPredeterminado = `<p class='valorPredeterminado activo'>Predeterminado</p>`;
                    }else{
                        valorPredeterminado = "";
                    }
                    const div = document.createElement("div");
                    div.classList.add("addressItem");
                    div.innerHTML = `

                    `;
                    addressesContainer.appendChild(div);
                });
            }

        })
        .catch(error => console.error("Error al cargar direcciones:", error));
    }