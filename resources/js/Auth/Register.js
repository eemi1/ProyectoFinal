document.addEventListener("DOMContentLoaded", () => {

    const register = document.querySelector('form');

    try {
        register.addEventListener('submit', (e) => {
            e.preventDefault();

            Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Deseas registrarte?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, registrarme',
                cancelButtonText: 'Cancelar',
                cancelButtonColor: "#d33",
            }).then((result) => {
                if (result.isConfirmed) {
                    let form_Register = new FormData(register);

                    fetch("/proyectoFinal/app/Functions/Auth/RegisterController.php", {
                        method: 'POST',
                        body: form_Register
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                        if (data.success) {
                            Swal.fire({
                                title: '¡Bienvenido!',
                                text: 'Te registraste correctamente.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => {
                                window.location.replace("Login.html");
                            });
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
                        Swal.fire({
                            title: 'Error',
                            text: 'Ocurrió un error al intentar conectarse con el servidor.',
                            icon: 'error',
                            confirmButtonText: 'Ok'
                        });
                    });
                }else{
                    return;
                }
            });
        });
    } catch (error) {
        console.log(error);
        Swal.fire({
            title: 'Error',
            text: 'Algo salió mal con el sistema de registro.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }

});
