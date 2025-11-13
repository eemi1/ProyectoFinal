document.addEventListener("DOMContentLoaded", ()=>{

const formLogin = document.querySelector('.form')

try{
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault()
        let formulario = new FormData(formLogin)

        fetch("app/Functions/Auth/LoginController.php", {
            method: 'POST',
            body: formulario
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.success){
                    Swal.fire({
                        title: 'Bienvenido de nuevo!',
                        text: `${data.message} con el ${data.nameRol}`,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(()=>{
                        fetch('app/Functions/check.php?action=verificar', {
                            credentials: "same-origin"
                        })
                        .then(res => res.json())
                        .then(data => {
                            console.log(data);
                    
                            if (!data.success) {
                                // No logueado
                                window.location.href = 'index.html';
                                return;
                            }

                            data.rol = parseInt(data.rol, 10);
                            switch (data.rol) {
                                case 1: // Cliente
                                    window.location.href = "index.html";
                                    break;
                    
                                case 2: // Admin
                                    window.location.href = "app/View/DashboardAdmin/adminPanel.html";
                                    break;
                    
                                case 3: // Mozo
                                    window.location.href = "app/View/DashboardAdmin/mozoPanel.html";
                                    break;
                    
                                case 4: // Cocinero
                                    window.location.href = "app/View/DashboardAdmin/cocineroPanel.html";
                                    break;
                    
                                case 5: // Gerente
                                    window.location.href = "app/View/DashboardAdmin/gerentePanel.html";
                                    break;
                                
                                case 6: // Delivery
                                    window.location.href = "app/View/DashboardAdmin/deliveryPanel.html";
                                    break;
                    
                                default:
                                    console.warn("Rol no reconocido:", data.rol);
                            }
                        })
                    })
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            })
            .catch((error) => {
                console.log(error); 
            })
        })
}catch(error){
    console.log(error);
}

});

