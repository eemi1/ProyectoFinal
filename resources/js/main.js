
document.addEventListener("DOMContentLoaded", () => {
    navLoggeado();
    menuProfile();
    cerrarSesion()
    });

    function navLoggeado(){
    try{
    fetch("app/Functions/check.php?action=verificar")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.querySelector(".navbar-buttons").style.display = "none";
                document.querySelector(".navbar-buttons-logged").style.display = "flex";
            } else {
                document.querySelector(".navbar-buttons").style.display = "flex";
                document.querySelector(".navbar-buttons-logged").style.display = "none";
            }
        })
        .catch(error => console.error("Error al verificar sesión:", error));
    }catch(error){
        console.log(error);
    }
    }

    function menuProfile(){
    const profile = document.getElementById('icon-profile-nav');
    const ddMenu = document.getElementById('dropdownMenu');

    try{
        profile.addEventListener("click", (e)=>{
            if (!profile.contains(e.target)){
                ddMenu.style.display = "none";
            }else{
                ddMenu.style.display = "flex";
            }
        });

    }catch(error){
        console.log(error);
    }
}

function cerrarSesion(){
        const btn_cerrarSesion = document.getElementById("logout")

        btn_cerrarSesion.addEventListener("click", (e) =>{
            fetch("app/Functions/check.php?action=cerrar", {
                        method: 'POST',
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success){
                            Swal.fire({
                                title: '¿Estás seguro?',
                                text: 'Estás seguro que deseas cerrar sesión?',
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonText: 'Cerrar sesión',
                                cancelButtonText: 'Cancelar',
                                cancelButtonColor: "#d33",
                                
                            }).then((result)=>{
                                if (result.isConfirmed){
                                    Swal.fire({
                                        title: 'Nos vemos!',
                                        text: `Cerraste sesión correctamente.`,
                                        icon: 'success',
                                        showConfirmButton: false,
                                        timer: 1500
                                    }).then(()=>{
                                        window.location.replace("index.php");
                                    })

                                }
                            })                           
                        }else{
                            return;
                        }
                    })
        })
    }

