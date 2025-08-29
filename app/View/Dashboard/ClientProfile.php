<?php
session_start();

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fory Factory | Mi perfil</title>
    <link rel="icon" href="../../../images/logo.jpg" type="image/x-icon">
    <link rel="stylesheet" href="../../../resources/css/components.css" type="text/css">
    <link rel="stylesheet" href="../../../resources/css/parts/nav.css" type="text/css">
    <link rel="stylesheet" href="../../../resources/css/parts/footer.css" type="text/css">
    <link rel="stylesheet" href="../../../resources/css/pages/dashboard/myProfile.css" type="text/css">
    <script src="https://kit.fontawesome.com/29724e3467.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&family=Rasa:ital,wght@0,300..700;1,300..700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-------------------------------------------------------------------------------------------------------------------------------------------->
    <!-------------------------------------------------NAV---------------------------------------------------------------------------------------->
    <!-------------------------------------------------------------------------------------------------------------------------------------------->
    <header class="header">
        <nav class="navbar">
            <a href="../../../index.php">
                <div class="navbar-content">
                    <img src="../../../images/logo.jpg" alt="Logo" class="navbar-logo">
                    <h1 class="navbar-title">Fory Factory</h1>
                </div>
            </a>

            <ul class="navbar-menu">
                <li><a href="../../../index.php">Inicio</a></li>
                <li><a href="#">Productos</a></li>
                <li><a href="#">Contacto</a></li>
                <li><a href="#">Sobre Nosotros</a></li>
            </ul>

            <!-- Menú desplegable para móviles -->
            <div class="navbar-dropdown">
                <i class="fa-solid fa-bars fa-2xl" id="icon-menu"></i>

            </div>

            <div class="navbar-buttons">
                <a href="../Auth/Login.html" id="navbar-btn-login">Iniciar Sesión</a>
                <a href="../Auth/Register.html" class="boton-primario" id="navbar-btn-register">Crear Cuenta</a>
            </div>

            <div class="navbar-buttons-logged">
                <a href="#favoritos" class="icon-nav-logged"><i class="fa-regular fa-heart fa-2xl" ></i></a>
                <a href="#cartera" class="icon-nav-logged"><i class="fa-solid fa-cart-shopping fa-2xl"></i></a>
                <div class="profile-logged">
                    <a id="icon-profile-nav"><img src="../../../images/default-photo.webp" alt="" id="photo-profile-img"></a>

                    <div class="dropdown-menu" id="dropdownMenu">
                        <ul id="dropdownMenu-list">
                            <li id="li-profile">
                                <img src="../../../images/default-photo.webp" id="photo-profile-img-li">
                                <div class="profile-info">
                                    
                                    <span class="username"><?php echo $_SESSION["usuario"]; ?></span>
                                    <span class="email"><?php echo $_SESSION["email"]; ?></span>
                                </div>
                            </li>
                            <li class="dropdown-item">
                                <a href="#" class="options-profile">
                                    <i class="fa-regular fa-user"></i>
                                    Mi perfil</a>
                            </li>
                            <li class="dropdown-item">
                                <a href="#" class="options-profile">
                                    <i class="fa-solid fa-gear"></i>
                                    Configuración</a>
                            </li>
                            <li class="dropdown-item">
                                <a href="#" class="options-profile">
                                    <i class="fa-regular fa-bell"></i>
                                    Notificaciones
                                </a>
                            </li>
                            <hr>
                            <li class="dropdown-item">
                                <a href="#" class="options-profile">
                                    <i class="fa-regular fa-moon"></i>
                                    Modo oscuro
                                </a>
                            </li>
                            <li class="dropdown-item">
                                <a href="#" class="options-profile-logout" id="logout">
                                    <i class="fa-solid fa-right-from-bracket"></i>
                                    Cerrar sesión
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                
            </div>
        </nav>
    </header>
    <hr class="navbar-divisor">
    <!-------------------------------------------------------------------------------------------------------------------------------------------->
    <!----------------------------------------------/NAV------------------------------------------------------------------------------------------>
    <!----------------------------------------------SECTION--------------------------------------------------------------------------------------->
    
    <main class="main">
        <h1 class="mainTitle">Mi Perfil</h1>
        <p class="mainSubtitle">Gestiona tu información personal</p>
        
        <ul class="tabOptions"> 
            <li>
                <a class="tablinks" href="#" onclick="openTab(event, 'datosPersonales')" id="defaultTab">
                    <i class="fa-regular fa-user"></i>
                    Datos personales
                </a>
            </li>
            <li>
                <a class="tablinks" href="" onclick="openTab(event, 'pedidos')">
                    <i class="fa-regular fa-clock"></i>
                    Pedidos
                </a>
            </li>
            <li>
                <a class="tablinks" href="" onclick="openTab(event, 'favoritos')">
                    <i class="fa-regular fa-heart"></i>
                    Favoritos
                </a>
            </li>
            <li>
                <a class="tablinks" href="" onclick="openTab(event, 'reservas')">
                    <i class="fa-regular fa-calendar"></i>
                    Reservas
                </a>
            </li>
            <li>
                <a class="tablinks" href="" onclick="openTab(event, 'recompensas')">
                    <i class="fa-solid fa-gift"></i>
                    Recompensas
                </a>
            </li>
            <li>
                <a class="tablinks" href="" onclick="openTab(event, 'reseñas')">
                    <i class="fa-regular fa-message"></i>
                    Reseñas
                </a>
            </li>
        </ul>
<!-- ----------------------------------------------------------------------------------------------------------------------------------- -->
<!-- ----------------------------------------------------------------------------------------------------------------------------------- -->
<!-- ----------------------------------------------------------------------------------------------------------------------------------- -->
    <section class="tabcontent" id="datosPersonales">

        <div class="accountDetails-photo-Title">
            <div class="mainTitle-photo">
                <i class="fa-solid fa-camera fa-lg"></i>
                <h2 class="mainTitle-photo">Avatar</h2>
            </div>
            <p class="mainSubtitle-photo">Elige tu imagen de perfil.</p>

            <div class="accountDetails-photo">
                <img src="../../../images/default-photo.webp" alt="">
                <div class="uploadImage-content">
                    <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" size="5MB"/>
                    <label class="avatar-lbl" for="avatar">
                        <i class="fa-solid fa-camera"></i>
                        Cambiar imagen
                    </label>
                    <p class="avatar-p">Formatos: JPG, PNG (máx. 5MB)</p>
                </div>     
            </div>
        </div>

        <div class="personalInformationAndLocation">
            <div class="content1">
                <div class="mainTitle-content1">
                    <div class="Title-h2">
                        <i class="fa-solid fa-id-card fa-lg"></i>
                        <h2 class="content1-title">Información personal</h2>
                    </div>
                    <div class="container-btn-edit">
                        <button class="btn-edit">
                        Editar
                        <img src="../../../images/edit-tool-pencil-svgrepo-com.svg" alt="">
                        </button>
                    </div>
                </div>
                <p class="content1-subtitle">Actualiza tus datos personales</p>

                <form action="myProfile.php?action=saveController" method="POST" class="content1-form" id="formPerfil" >
                    <label for="">Nombre completo:</label>
                    <input type="text" name="nombreCompleto" class="content1-form-input" required readonly data-original-value="<?php echo $_SESSION["usuario"] ?? ''; ?>" value="<?php echo $_SESSION["usuario"] ?? ''; ?>">
                    <label for="">Email:</label>
                    <input type="text" name="email" class="content1-form-input" required id="input-email" readonly data-original-value="<?php echo $_SESSION["email"] ?? ''; ?>" value="<?php echo $_SESSION["email"] ?? ''; ?>">
                    <label for="">Teléfono:</label>
                    <input type="text" name="telefono" class="content1-form-input" required readonly data-original-value="<?php echo $_SESSION["tel"] ?? ''; ?>" value="<?php echo $_SESSION["tel"] ?? ''; ?>">
                    <label for="">Fecha de nacimiento:</label>
                    <input type="date" name="fechaNacimiento" class="content1-form-input" required readonly data-original-value="<?php echo $_SESSION["fechaNacimiento"] ?? ''; ?>" value="<?php echo $_SESSION["fechaNacimiento"] ?? ''; ?>">
                </form>
                <div class="btns-SaveAndCancel">
                    <button class="btn-cancel">
                        Cancelar
                        <!-- <img src="../../../images/edit-tool-pencil-svgrepo-com.svg" alt=""> -->
                    </button>    

                    <button class="btn-save"    >
                        Guardar
                        <img src="../../../images/edit-tool-pencil-svgrepo-com.svg" alt="">
                    </button>
                </div>
            </div>
            <div class="content2">
                <div class="mainTitle-content2">
                    <i class="fa-solid fa-house fa-lg"></i>
                    <h2 class="content2-title">Preferencias y Ubicación</h2>
                </div>
                <p class="content2-subtitle">Administra preferencias sobre tus direcciones</p>

                <!-- BOTÓN MODAL -->
                <div class="container-direccion">
                    <p>0 Guardada(s)</p>

                    <button class="btn-direccion" id="btnAgregarDireccion">
                        <i class="fa-solid fa-plus"></i>
                        Agregar dirección
                    </button>
                </div>
                <!-- MODAL -->
                <div id="modalDireccion" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span> <!--simbolo "x" -->
                        <h2>Agregar dirección</h2>
                        <form>
                            <label>Dirección:</label>
                            <input type="text" required>
                            <label>Piso/Apartamento:</label>
                            <input type="text">
                            <label>Indicaciones para la entrega:</label>
                            <input type="text">
                            <button type="submit">Guardar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="allergiesAndfoodRestrictions">
            <div class="afr-top-content">
                <div class="mainTitle-afr">
                    <i class="fa-solid fa-triangle-exclamation fa-lg"></i>
                    <h2 class="afr-title">Alergias y Restricciones Alimentarias</h2>
                </div>
                <p class="afr-subtitle">Selecciona tus alergias e intoleracias para una experiencia más segura.</p>

                <div class="afr-content-checkbox">
                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-gluten" name="afr-gluten">
                        <label for="afr-gluten">Gluten</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-lacteos" name="afr-lacteos">
                        <label for="afr-lacteos">Lácteos</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-soja" name="afr-soja">
                        <label for="afr-soja">Soja</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-huevos" name="afr-huevos">
                        <label for="afr-huevos">Huevos</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-frutosSecos" name="afr-frutosSecos">
                        <label for="afr-frutosSecos">Frutos secos</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-sesamo" name="afr-sesamo">
                        <label for="afr-sesamo">Sésamo</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-pescadoMariscos" name="afr-pescadoMariscos">
                        <label for="afr-pescadoMariscos">Pescado y mariscos</label>
                    </div>
                    

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-vegetarianos" name="afr-vegetarianos">
                        <label for="afr-vegetarianos">Vegetarianos</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-veganos" name="afr-veganos">
                        <label for="afr-veganos">Veganos</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-celiacos" name="afr-celiacos">
                        <label for="afr-celiacos">Celíacos</label>
                    </div>

                    <div class="afr-container-checkbox">
                        <input type="checkbox" id="afr-diabeticos" name="afr-diabeticos">
                        <label for="afr-diabeticos">Diabéticos</label>
                    </div>

                    <div class="afr-selected">
                        <div class="afr-selected-content-title">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <h4 class="afr-selected-title">Tus alergías seleccionadas:</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div class="statistics">
            <div class="mainTitle-statistics">
                <i class="fa-solid fa-chart-simple fa-lg"></i>
                <h2 class="statistics-title">Estadísticas de actividad</h2>
            </div>
                <p class="statistics-subtitle">Tu historial y datos de uso en la plataforma.</p>

            <div class="mainContainer">
                <div class="totalReservations">
                    <h5 id="totalReservations-h5">12</h5>
                    <h4 id="totalReservations-h4">Productos</h4>
                    <p id="totalReservations-p">Agregados a favoritos!</p>

                </div>

                <div class="totalFavorites">
                    <h5 id="totalFavorites-h5">6</h5>
                    <h4 id="totalFavorites-h4">Reservas Totales</h4>
                    <p id="totalFavorites-p">desde que te uniste!</p>

                </div>

                <div class="totalExpense">
                    <h5 id="totalExpense-h5">$45</h5>
                    <h4 id="totalExpense-h4">Pesos</h4>
                    <p id="totalExpense-p">Gastados.</p>

                </div>  

                <div class="lastReservation">
                    <h5 id="lastReservation-h5">14</h5>
                    <h4 id="lastReservation-h4">Compras</h4>
                    <p id="lastReservation-p">Realizadas en la página!</p>

                </div>
            </div>
            <hr id="divisor-statistics">

            <div class="member">
                <i class="fa-solid fa-calendar-days"></i>
                <p class="member-since">Miembro desde: </p>
            </div>

            

        </div>

        
    </section>
<!-- ----------------------------------------------------------------------------------------------------------------------------------- -->
<!-- ----------------------------------------------------------------------------------------------------------------------------------- -->
<!-- ----------------------------------------------------------------------------------------------------------------------------------- -->
    
    <section id="pedidos" class="tabcontent">
        <div class="pedidos-default">
            <div id="container-default-text">
                <h1 id="default-title">Historial de Pedidos</h1>
                <p id="default-subtitle">Aquí podrás ver todos tus pedidos anteriores.</p>
            </div>
        </div>
    </section>

    <section id="favoritos" class="tabcontent">
        <div class="favoritos-default">
            <div id="container-default-text">
                <h1 id="default-title">Productos Favoritos</h1>
                <p id="default-subtitle">Tus productos favoritos aparecerán aquí.</p>
            </div>
        </div>
    </section>

    <section id="reservas" class="tabcontent">
        <div class="reservas-default">
            <div id="container-default-text">
                <h1 id="default-title">Mis Reservas</h1>
                <p id="default-subtitle">Gestiona tus reservas activas y futuras.</p>
            </div>
        </div>
    </section>

    <section id="recompensas" class="tabcontent">
        <div class="recompensas-default">
            <div id="container-default-text">
                <h1 id="default-title">Programa de Recompensas</h1>
                <p id="default-subtitle">Consulta tus puntos y recompensas disponibles.</p>
            </div>
        </div>
    </section>

    <section id="reseñas" class="tabcontent">
        <div class="reseñas-default">
            <div id="container-default-text">
                <h1 id="default-title">Mis Reseñas</h1>
                <p id="default-subtitle">Revisa las reseñas que has dejado.</p>
            </div>
        </div>
    </section>

</main>

<!---------------------------------------------------------/SECTION------------------------------------------------------------------------------>
<!---------------------------------------------------------FOOTER-------------------------------------------------------------------------------->
<!----------------------------------------------------------------------------------------------------------------------------------------------->
    <footer class="footer">
        <div class="footer-main-content">

            <div class="footer-container1">
                <div class="footer-content-1">
                    <h4 class="footer-content1-h4">Fory Factory</h4>
                    <p id="footer-content1-description">Especialistas en fabricación de productos de alta calidad. Comprometidos con la excelencia y la innovación en cada proyecto.</p>
                </div>
            </div>

            <div class="footer-container2">
                <div class="footer-content-2">
                    <h4 class="footer-content2-h4">Atajos</h4>
                    <a class="footer-content2-a" href="/">Inicio</a>
                    <a class="footer-content2-a" href="/productos">Productos</a>
                    <a class="footer-content2-a" href="/sobre-nosotros">Sobre nosotros</a>
                </div>
            </div>
            
            <div class="footer-container3">
                <div class="footer-content-3">
                    <h4 class="footer-content3-h4">Contacto</h4>
                    <p class="footer-content3-a">contacto@foryfactory.com</p>
                    <p class="footer-content3-a">+598 99 999 999</p>
                    <p class="footer-content3-a">Av. Río Negro 1711, Ciudad de la costa</p>
                </div>
            </div>
        </div>
        <hr class="footer-divisor">

        <div class="footer-content4">
            <p id="footer-derechos" class="">© 2025 Fory Factory. Todos los derechos reservados.</p>
            <p id="footer-developedBy" class="">Desarrollado por TEN</p>
        </div>

    </footer>
    <!-------------------------------------------------------------------------------------------------------------------------------------------->
    <!-------------------------------------------------------/FOOTER------------------------------------------------------------------------------>
    <!-------------------------------------------------------------------------------------------------------------------------------------------->
    <script src="../../../resources/js/dashboard/myProfile.js"></script>
    <script src="../../../resources/js/main.js"></script>
</body>
</html>