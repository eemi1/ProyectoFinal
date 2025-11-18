// configuracion.js
export function initConfiguracion() {
    console.log("initConfiguracion ejecutado");
    changeOpt();
    getConfigurationRestaurant();
    sentConfigurationRestaurant();
    loadTablesConfiguration();
    loadConfigReservations();
}
//========================================
// ==             RESTAURANTE           ==
//========================================


function changeOpt() {
  const opcionesList = document.querySelectorAll('.filtersConfig a');
  const secciones = document.querySelectorAll('.optConfig');

  if (!opcionesList.length || !secciones.length) return;

  let savedTab = localStorage.getItem("pestanaConfigActiva");

  // Si no existe o dejó de existir, usar fallback
  if (!savedTab || !document.querySelector(savedTab)) {
    savedTab = "#restauranteConfig";
  }

  // Reset
  opcionesList.forEach(link => link.classList.remove('activo'));
  secciones.forEach(sec => sec.style.display = 'none');

  // Activar la pestaña guardada
  const savedLink = document.querySelector(`.filtersConfig a[href="${savedTab}"]`);
  const savedSection = document.querySelector(savedTab);

  if (savedLink && savedSection) {
    savedLink.classList.add('activo');
    savedSection.style.display = 'flex';
  }

  // Listener de clicks
  opcionesList.forEach(optList => {
    optList.addEventListener('click', e => {
      e.preventDefault();

      const targetId = optList.getAttribute('href');
      localStorage.setItem("pestanaConfigActiva", targetId);

      opcionesList.forEach(link => link.classList.remove('activo'));
      secciones.forEach(sec => sec.style.display = 'none');

      optList.classList.add('activo');
      const targetDiv = document.querySelector(targetId);
      if (targetDiv) targetDiv.style.display = 'flex';
    });
  });
}

async function getConfigurationRestaurant() {
  try {
    const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=getConfigurationRestaurant');
    const data = await res.json();
    console.log('GET', data);

    if (!data.configuration) console.log("No hay configuración predeterminada");
    document.getElementById('nombreRestaurante').value = data.configuration.nombre || '';
    document.getElementById('capacidadRestaurante').value = data.configuration.capacidad_total || '';
    document.getElementById('descripcionRestaurante').value = data.configuration.descripcion || '';
    document.getElementById('telefonoRestaurante').value = data.configuration.telefono || '';
    document.getElementById('emailRestaurante').value = data.configuration.email || '';
    document.getElementById('direccionRestaurante').value = data.configuration.direccion || '';
    document.getElementById('restauranteImageTag').src = '/uploads/logo/logo.jpg?' + new Date().getTime(); // Evitar caché
    
  }catch($e){
  console.log("Error al obtener la configuración del restaurante", $e);
  }
}

export async function sentConfigurationRestaurant() {

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
          const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=sentConfigurationRestaurant', {
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
//========================================
// ==               MESAS               ==
//========================================
export async function loadTablesConfiguration() {
  try{
    const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=loadTables');
    const data = await res.json();
    console.log(data);

    if(data.success){
      const mesaContenedor = document.getElementById("contenedorMesaConfig");
      if (!mesaContenedor) return;
      mesaContenedor.innerHTML = '';

      data.data.forEach(mesa => {
        const ctnDiv = document.createElement('div');
        ctnDiv.classList.add('tableConfigItem');
        ctnDiv.dataset.id = mesa.id;
        ctnDiv.innerHTML = `
        <div class="contentTables Header">
          <h3>Mesa: ${mesa.id}</h3>
            <button type="button" class="buttonTableSave" style="display:none;" data-id="${mesa.id}">Guardar cambios</button>
        </div>
        <div class="contentTables Tables">
          <div class="contentTables inputContainer">
            <label>Cantidad</label>
            <input type="number" value="${mesa.capacidad}" data-original="${mesa.capacidad}" class="mesa-input" min="1">
          </div>
          <div class="contentTables inputContainer">
            <label>Descripción</label>
            <input type="text" value="${mesa.descripcion}" data-original="${mesa.descripcion}" class="mesa-input">
          </div>
        </div>
        <div class="contentTables Footer">
          <button type="button" class="buttonTable"><i class="fa-regular fa-trash-can"></i>Eliminar</button>
        </div>
        `
        mesaContenedor.appendChild(ctnDiv);
      })
      listenNewChangesTables();
      createNewTable();
      deleteTable();
    }
  }catch(error){
    console.log("Error al cargar las mesas", error);
  }
}

export async function listenNewChangesTables() {
  const items = document.querySelectorAll('.tableConfigItem');

  items.forEach(item => {
    const inputs = item.querySelectorAll('.mesa-input');
    const saveButton = item.querySelector('.buttonTableSave');
    const idMesa = item.dataset.id;

    // Listener para cada input
    inputs.forEach(input => {
      input.addEventListener('input', () => {

        let hayCambios = false;

        inputs.forEach(i => {
          if (i.value != i.dataset.original) {
            hayCambios = true;
          }
        });
        // Mostrar u ocultar botón
        saveButton.style.display = hayCambios ? 'block' : 'none';
      });
    });
    // CLICK EN GUARDAR CAMBIOS
    saveButton.addEventListener('click', async () => {

      const capacidad = item.querySelector('input[type="number"]').value;
      const descripcion = item.querySelector('input[type="text"]').value;

      const formData = new FormData();
      formData.append("id", idMesa);
      formData.append("capacidad", capacidad);
      formData.append("descripcion", descripcion);

      const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=updateTable', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {

        // Actualizar valores originales
        inputs.forEach(i => {
          i.dataset.original = i.value;
        });

        saveButton.style.display = 'none';

        Swal.fire({
          icon: 'success',
          title: 'Mesa actualizada',
          timer: 1400,
          showConfirmButton: false
        });
      }
    });

  });
}

export async function createNewTable() {
  const btnAdd = document.querySelector('.btnAddTableConfig');
  if (!btnAdd) return;

  btnAdd.addEventListener('click', async () => {

    Swal.fire({
      title: "Agregar nueva mesa",
      html: `
      <div class="modalAddTables">
        <label>Capacidad</label>
        <input type="number" id="nuevaCapacidad" class="swal2-input" min="1" value="1">
      </div>
      <div class="modalAddTables">
        <label>Descripción</label>
        <input type="text" id="nuevaDescripcion" class="swal2-input" value="">
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cancelar"
    }).then(async result => {

      if (!result.isConfirmed) return;

      const capacidad = document.getElementById("nuevaCapacidad").value;
      const descripcion = document.getElementById("nuevaDescripcion").value;

      const formData = new FormData();
      formData.append("capacidad", capacidad);
      formData.append("descripcion", descripcion);

      const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=addTable', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Mesa agregada',
          timer: 1200,
          showConfirmButton: false
        });

        loadTablesConfiguration(); // refrescar lista
      }
    });

  });
}

export function deleteTable() {
  const items = document.querySelectorAll('.tableConfigItem');

  items.forEach(item => {
    const btnRemove = item.querySelector('.buttonTable');
    const idMesa = item.dataset.id;

    btnRemove.addEventListener('click', () => {

      Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Eliminar'
      }).then(async result => {

        if (!result.isConfirmed) return;

        const formData = new FormData();
        formData.append("id", idMesa);

        const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=deleteTable', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        console.log(data);

        if (data.success) {

          Swal.fire({
            icon: 'success',
            title: 'Mesa eliminada',
            timer: 1400,
            showConfirmButton: false
          });

          loadTablesConfiguration(); // refrescar listado
        }
      });

    });
  });
}
//========================================
// ==               RESERVAS            ==
//========================================

export async function loadConfigReservations() {
  try{
    const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=loadReservations');
    const data  = await res.json();
    console.log('DATA RECIBIDA:', data);

    if(data.success){
      const containerRes = document.getElementById('contenedorReservaConfig');
      containerRes.innerHTML = '';

      const politicas = [
        "Libre cancelación",
        "24 horas antes",
        "48 horas antes",
        "No cancelable"
      ];

      const options = politicas.map(p => `
        <option value="${p}" ${p === data.configurationRes.politica_cancelacion ? "selected" : ""}>
          ${p}
        </option>
      `).join("");

      containerRes.innerHTML = `
        <form class="formConfig" id="reservationForm">
          <h2>Configuración de Reservas</h2>
          <div class="restaurante-grid">
            <div>
              <label for="duracionPromedio">Duración Promedio (minutos)</label>
              <input type="number" id="duracionPromedio" name="duracionPromedio" value="${data.configurationRes.duracion_promedio}">
              <small>Tiempo estimado por reserva</small>
            </div>

            <div>
              <label for="tiempoBloqueo">Tiempo de Bloqueo (minutos)</label>
              <input type="number" id="tiempoBloqueo" name="tiempoBloqueo" value="${data.configurationRes.tiempo_bloqueo}">
            </div>

            <div>
              <label for="anticipacionMinima">Anticipación Mínima (días)</label>
              <input type="number" id="anticipacionMinima" name="anticipacionMinima" value="${data.configurationRes.anticipacion_minima}">
            </div>

            <div>
              <label for="anticipacionMaxima">Anticipación Máxima (días)</label>
              <input type="number" id="anticipacionMaxima" name="anticipacionMaxima" value="${data.configurationRes.anticipacion_maxima}">
            </div>

            <div class="restaurante-full">
              <label for="">Política de Cancelación</label>
              <select id="politicaCancelacion" name="politicaCancelacion">
                <option value="">Seleccionar...</option>
                ${options}
              </select>
            </div>

          </div>
          <button type="submit" class="guardarCambiosRes">Guardar Cambios</button>
        </form>
      `;
    }
    updateReservation();

  }catch(error){
    console.log('Error la cargar la configuración de las reservas', error);
  }
}

export async function updateReservation() {

  try{
    const form = document.getElementById('reservationForm');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      Swal.fire({
        title: 'Estas seguro',
        text: 'Deseas actualizar la configuración',
        icon: 'question',
        confirmButtonColor: 'var(--primary-color)',
        cancelButtonColor: 'red',
        confirmButtonText: 'Actualizar'
      }).then(async result => {
        if (!result.isConfirmed) return;
        const formData = new FormData(form);
        const res = await fetch('/app/Functions/dashboardAdmin/configuracion.php?action=updateReservations', {
          method: 'POST',
          credentials: "same-origin",
          body: formData,
        })
        const data = await res.json();

        if (data.success){
          Swal.fire({
          title: 'Guardado exitosamenet',
          text: data.message,
          icon: 'success',
          timer:1200,
          showConfirmButton: true,
          confirmButtonText: 'Cerrar',
        })
        }else{
          Swal.fire({
            title: 'Error',
            text: data.message,
            icon: 'error'
          });
        }
      })
    })
  }catch(error){
    console.log(error);
  }
}