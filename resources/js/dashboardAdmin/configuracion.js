// configuracion.js
export function initConfiguracion() {
    console.log("initConfiguracion ejecutado");
    changeOpt();
    getConfigurationRestaurant();
    sentConfigurationRestaurant();
}



function changeOpt() {
  const opcionesList = document.querySelectorAll('.filtersConfig a');
  const secciones = document.querySelectorAll('.optConfig');

    if (opcionesList.length > 0 && secciones.length > 0) {
        opcionesList[0].classList.add('activo');
        secciones[0].style.display = 'flex';
    }

  opcionesList.forEach(optList => {
    optList.addEventListener('click', e => {
      e.preventDefault();

      // Quitar clase activo de todos
      opcionesList.forEach(link => link.classList.remove('activo'));

      // Ocultar todos los divs
      secciones.forEach(sec => sec.style.display = 'none');

      // Agregar clase activo al optList clickeado
      optList.classList.add('activo');

      // Mostrar el div correspondiente
      const targetId = optList.getAttribute('href');
      const targetDiv = document.querySelector(targetId);
      if (targetDiv) {
        targetDiv.style.display = 'flex';
      }
    });
  });
};

async function getConfigurationRestaurant() {
  try {
    const res = await fetch('app/Functions/dashboardAdmin/configuracion.php?action=getConfigurationRestaurant');
    const data = await res.json();
    console.log('GET', data);

    if (!data.configuration) console.log("No hay configuración predeterminada");


    document.getElementById('nombreRestaurante').value = data.configuration.nombre || '';
    document.getElementById('capacidadRestaurante').value = data.configuration.capacidad_total || '';
    document.getElementById('descripcionRestaurante').value = data.configuration.descripcion || '';
    document.getElementById('telefonoRestaurante').value = data.configuration.telefono || '';
    document.getElementById('emailRestaurante').value = data.configuration.email || '';
    document.getElementById('direccionRestaurante').value = data.configuration.direccion || '';
    document.getElementById('restauranteImageTag').src = 'uploads/logo/logo.jpg?' + new Date().getTime(); // Evitar caché
    
  }catch($e){
  console.log("Error al obtener la configuración del restaurante", $e);
  }
}

async function sentConfigurationRestaurant() {

  const btnSubmit = document.querySelector('.submitRestaurant');
  const form = document.querySelector('.restauranteForm');

  btnSubmit.addEventListener('click', async(e) => {
    e.preventDefault();
    const formDataRestaurant = new FormData(form);
    console.log('POST', formDataRestaurant);

    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar cambios!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('app/Functions/dashboardAdmin/configuracion.php?action=sentConfigurationRestaurant', {
            method: 'POST',
            credentials: 'same-origin',
            body: formDataRestaurant
          });
          const data = await res.text();  
          console.log('Respuesta del servidor:', data);
          Swal.fire({
            title: 'Guardado exitoso!',
            text: 'La configuración del restaurante ha sido actualizada.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          })
          getConfigurationRestaurant();
        }catch(error){
          console.log("Error al enviar la configuración del restaurante", error);
        }
      } 
    })
  })
}