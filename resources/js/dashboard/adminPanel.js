window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("defaultTab").click();
    chartVentas();
    loadUsers();
    submitAddUserForm(event);
});

function options(event, tabOption){
    event.preventDefault();

    document.querySelectorAll('.optContent').forEach(tab => {
        tab.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabOption);
    if(selectedTab){
        selectedTab.style.display = 'flex';
    }

    document.querySelectorAll('.sidebar-options').forEach(link => {
        link.classList.remove('active');
    });

    event.currentTarget.classList.add('active');
}

function chartVentas(){
    var chart = new CanvasJS.Chart("ventasChart", {
	theme: "light1", // "light2", "dark1", "dark2"
	animationEnabled: true, // change to true		
    axisY:{
        gridThickness: 0,
        lineThickness: 0,
        labelFormatter: function () { return ""; },

    },
    axisX:{
        lineThickness: 0,
        tickLength: 0,
        gridThickness: 0,
        reversed:true,
    },
	data: [
	{
		// Change type to "bar", "area", "spline", "pie",etc.
		type: "bar",
		dataPoints: [
			{ label: "Lunes",  y: 10  },
			{ label: "Martes", y: 15  },
			{ label: "Miércoles", y: 25  },
			{ label: "Jueves",  y: 30  },
			{ label: "Viernes",  y: 28  },
            { label: "Sábado",  y: 32  },
            { label: "Domingo",  y: 24  }
		]
	}
	]
});
chart.render();

}

function loadUsers() {
    fetch("/proyectoFinal/app/Functions/dashboardAdmin/usuarios.php", {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        console.log("Respuesta JSON:", data);
        if (data.success) {
            const userTableBody = document.querySelector("#table-users tbody");
            userTableBody.innerHTML = ""; // Limpiar tabla existente

            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#16a34a" viewBox="0 0 24 24"><circle cx="12" cy="7" r="5"/><path d="M12 14c-5 0-9 2.5-9 6v1h18v-1c0-3.5-4-6-9-6z"/></svg>`;
            const defaultImg = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
            
            data.data.usuarios.forEach(user => {

                let rolClass = "";
                let icon = "";
                switch (user.id_rol) {
                    case 1:
                        icon = `<i class="fa-solid fa-user"></i>`;
                        rolClass = "rol-cliente"; 
                        break;
                    case 2:
                        icon = `<i class="fa-solid fa-crown"></i>`;
                        rolClass = "rol-admin"; 
                        break;
                    case 3:
                        icon = `<i class="fa-solid fa-bell-concierge"></i>`;
                        rolClass = "rol-mozo"; 
                        break;
                    case 4:
                        icon = `<i class="fa-solid fa-kitchen-set"></i>`;
                        rolClass = "rol-cocinero"; 
                        break;
                    case 5:
                        icon = `<i class="fa-solid fa-user-shield"></i>`;
                        rolClass = "rol-gerente"; 
                        break;
                    case 6:
                        icon = `<i class="fa-solid fa-truck"></i>`;
                        rolClass = "rol-delivery"; 
                        break;
                };
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        <div class="container-user">
                            <div class="container-user-image">
                                <img src="${user.image || defaultImg}" alt="User Image">
                            </div>
                            <div class="container-user-info">
                                <p class="user-name">${user.nombreCompleto}</p>
                                <div class="user-email-container">
                                    <i class="fa-regular fa-envelope"></i><p class="user-email">${user.mail}</p>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="${rolClass}">
                            ${icon} ${user.rol}
                        </div>
                    </td>
                    <td>0</td>
                    <td><i class="fa-solid fa-calendar" style="color: #969696;"></i> ${user.fechaRegistro}</td>
                    <td>
                        <button id="btnOptions">
                            <i class="fa-solid fa-ellipsis fa-lg"></i>
                        </button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        }
    });
}

function openAddUserWindow() {
    const windowAddUser = document.querySelector(".windowAddUser");

    btn = document.getElementById("btnAddUser");

    btn.addEventListener("click", function() {
        windowAddUser.style.display = "block";

        fetch("/proyectoFinal/app/Functions/dashboardAdmin/addUser.php", {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(res => res.json())
    .then(data => {
        if(data.success){
            console.log(data.message)
            location.href = "/proyectoFinal/app/View/DashboardAdmin/adminPanel.php";

        }else{
            console.error("Error al cargar roles:", data.message);
        }
    });
    });

}

function closeAddUserWindow() {
    const windowAddUser = document.querySelector(".windowAddUser");
    windowAddUser.style.display = "none";
}

function btnActionsUser(event){
    event.preventDefault();
    const btnOptions = document.getElementById("btnOptions");
    console.log("Botón de opciones clickeado");
}

