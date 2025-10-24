document.addEventListener("DOMContentLoaded", () => {
    // Abrir la pestaña por defecto
    document.getElementById("defaultTab").click();

    // Verificar sesión
    fetch("/proyectoFinal/app/Functions/check.php?action=verificar")
    .then(res => res.json())
    .then(data => {
        console.log(data);
        if(!data.success){
            console.log(data.message);
            window.location.href = "/proyectoFinal/app/View/Auth/Login.html";
        } else {
            console.log(data.message);
        }
    });

    // Inicializar botones
    initButtons();
    FechaMiembro();
    abrirModalDireccion();
    currentDateUser();
    getOrders();
    getReservations();
    initDireccionForm();

});

function openTab(event, tabOption){
    event.preventDefault();

    document.querySelectorAll('.tabcontent').forEach(tab => {
        tab.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabOption);
    if(selectedTab){
        selectedTab.style.display = 'flex';
    }

    document.querySelectorAll('.tablinks').forEach(link => {
        link.classList.remove('active');
    });

    event.currentTarget.classList.add('active');
}


