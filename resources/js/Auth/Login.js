document.addEventListener("DOMContentLoaded", ()=>{

const formLogin = document.getElementById('form-login')

try{
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault()
        let formulario = new FormData(formLogin)

        fetch("../../Functions/LoginController.php", {
            method: 'POST',
            body: formulario
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.success){
                    Swal.fire({
                        title: 'Bienvenido de nuevo!',
                        text: `${data.message} con el ${data.rol}`,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(()=>{
                        window.location.replace("../../../index.php");
                    })
            }else{
                console.log("error de autenticación")
                    Swal.fire({
                        title: 'Error',
                        text: data.message,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    }).then(()=>{
                        return;
                    })
                
                
            }
        })
    })
}catch(error){
    console.log(error);
    Swal.fire({
        title: 'Error',
        text: 'Algo salió mal con la conexión al servidor.',
        icon: 'error',
        confirmButtonText: 'Ok'
    }).then(()=>{
        return;
    })

}
})