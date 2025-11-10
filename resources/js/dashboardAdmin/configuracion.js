window.addEventListener('DOMContentLoaded', () => {
    changeOpt();
});


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
