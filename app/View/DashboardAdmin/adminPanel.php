    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fory Factory | Panel Admin</title>
        <link rel="icon" href="../../../images/logo.jpg" type="image/x-icon">
        <link rel="stylesheet" href="/proyectoFinal/resources/css/pages/dashboardAdmin/adminPanel.css" type="text/css">
        <script src="https://kit.fontawesome.com/29724e3467.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&family=Rasa:ital,wght@0,300..700;1,300..700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body>
        <header class="navbar">
            <div class="navbar-logo">
                <img src="../../../images/logo.jpg" alt="Logo" class="img">
                <h1>Fory Factory</h1>
                <span>Admin</span>
            </div>
            <div class="navbar-right">
                <span class="user">Admin</span>
                <i class="fa-solid fa-user-circle"></i>
            </div>
        </header>

        <div class="layout">
            <aside class="container-sidebar">
                <h1>Panel Admin</h1>
                <nav class="sidebar">
                    <ul class="sidebar-list">
                        <li><a href="#" class="sidebar-options" onclick="options(event, 'dashboardMain')"><i class="fa-solid fa-chart-column"></i> Dashboard</a></li>
                        <li><a href="#" class="sidebar-options" onclick="options(event, 'dashboardUsuarios')" id="defaultTab"><i class="fa-solid fa-user"></i> Usuarios</a></li>
                        <li><a href="#" class="sidebar-options" onclick="options(event, 'dashboardProductos')"><i class="fa-solid fa-box"></i> Productos</a></li>
                        <li><a href="#" class="sidebar-options" onclick="options(event, 'dashboardCategorias')"><i class="fa-solid fa-tags"></i> Categorías</a></li>
                        <li><a href="#" class="sidebar-options" onclick="options(event, 'dashboardPedidos')"><i class="fa-solid fa-cart-shopping"></i> Pedidos</a></li>
                        <li><a href="#" class="sidebar-options" onclick="options(event, 'dashboardReportes')"><i class="fa-solid fa-chart-line"></i> Reportes</a></li>
                        <li><a href="#" class="sidebar-options" onclick="options(event, 'dashboardConfiguracion')"><i class="fa-solid fa-cog"></i> Configuración</a></li>
                        <li><a href="#" id="logout"><i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</a></li>
                    </ul>
                </nav>
            </aside>

            <main class="container-main">
                <!--=== | DASHBOARD PRODUCTOS | === -->
                <section class="optContent" id="dashboardMain">
                    <header>
                        <h2 class="optContent-title">Bienvenido al Panel de Control</h2>
                        <h3 id="mainSubtitle">Gestiona tu restaurante desde aquí. Aquí tienes un resumen de la actividad de hoy.</h3>
                    </header>

                    <div class="dashboard-summary">
                    <!-- Tarjeta individual -->
                        <div class="summary-card">
                            <div class="summary-card-header">
                                <h3 class="summary-title">Ventas Hoy</h3>
                                <i class="summary-icon fa-solid fa-dollar-sign" id="ventas-hoy-icon"></i>
                            </div>
                            <p class="summary-value">$2,450</p>
                            <div class="summary-card-footer">
                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> 
                                    <path d="M4 4V16C4 18.2091 5.79086 20 8 20H20" stroke="none" stroke-linecap="round" stroke-linejoin="round"/> 
                                    <path d="M6.59869 14.5841C6.43397 14.8057 6.48012 15.1189 6.70176 15.2837C6.9234 15.4484 7.2366 15.4022 7.40131 15.1806L6.59869 14.5841ZM19.4779 
                                    4.85296C19.3967 4.58903 19.1169 4.4409 18.853 4.52211L14.552 5.8455C14.288 5.92671 14.1399 6.2065 14.2211 6.47043C14.3023 6.73436 14.5821 6.88249 
                                    14.846 6.80128L18.6692 5.62493L19.8455 9.44805C19.9267 9.71198 20.2065 9.8601 20.4704 9.7789C20.7344 9.69769 20.8825 9.41789 20.8013 9.15396L19.4779 4.85296ZM13.5434 12.4067L13.1671 
                                    12.7359L13.5434 12.4067ZM15.1797 12.2161L15.6216 12.45L15.1797 12.2161ZM7.40131 15.1806L10.6621 10.7929L9.85952 10.1964L6.59869 14.5841L7.40131 15.1806ZM11.4397 10.7619L13.1671 
                                    12.7359L13.9196 12.0774L12.1923 10.1034L11.4397 10.7619ZM15.6216 12.45L19.4419 5.23394L18.5581 4.76606L14.7378 11.9821L15.6216 12.45ZM13.1671 12.7359C13.8594 13.5272 15.1297 
                                    13.3792 15.6216 12.45L14.7378 11.9821C14.5739 12.2919 14.1504 12.3412 13.9196 12.0774L13.1671 12.7359ZM10.6621 10.7929C10.8522 10.5371 11.2299 10.522 11.4397 10.7619L12.1923 
                                    10.1034C11.5628 9.38385 10.4298 9.42903 9.85952 10.1964L10.6621 10.7929Z" fill="#16a34a"/> 
                                </svg>
                                <p class="summary-footer-text">+12.5%</p>
                            </div>
                        </div>

                        <div class="summary-card">
                            <div class="summary-card-header">
                                <h3 class="summary-title">Pedidos Activos</h3>
                                <i class="summary-icon fa-solid fa-cart-shopping" id="pedidos-activos-icon"></i>
                            </div>
                            <p class="summary-value">23</p>
                        </div>

                        <div class="summary-card">
                            <div class="summary-card-header">
                                <h3 class="summary-title">Reservas Hoy</h3>
                                <i class="summary-icon fa-regular fa-calendar" id="reservas-hoy-icon"></i>
                            </div>
                            <p class="summary-value">18</p>
                        </div>

                        <div class="summary-card">
                            <div class="summary-card-header">
                                <h3 class="summary-title">Stock: Bajo</h3>
                                <i class="summary-icon fa-solid fa-triangle-exclamation" id="stock-bajo-icon"></i>
                            </div>
                            <p class="summary-value">5</p>
                        </div>
                    </div>

                    <!-- Sección de gráficas -->
                    <div class="dashboard-charts">
                        <div class="chart-card">
                            <h3 class="chart-title">
                                <i class="fa-solid fa-chart-simple" style="color:#16a34a;"></i>
                                Ventas Últimos 7 Días
                            </h3>
                            <div id="ventasChart">

                            </div>
                        </div>

                        <div class="chart-card">
                            <h3 class="chart-title">
                                <i class="fa-solid fa-chart-line" style="color:#16a34a;"></i>
                                Platos Más Populares
                            </h3>
                            <canvas id="platosChart"></canvas>
                        </div>
                    </div>
                </section>

                <!--=== | DASHBOARD USUARIOS | === -->
                <section class="optContent" id="dashboardUsuarios">
                    <header class="userHeader">
                        <div>
                            <h2 class="optContent-title">Gestión de Usuarios</h2>
                            <h3 id="mainSubtitle">Administra usuarios, roles y permisos del sistema.</h3>
                        </div>
                        <button id="btnAddUser" onclick="openAddUserWindow()">
                            <i class="fa-solid fa-user-plus"></i> Añadir Usuario
                        </button>
                    </header>


                    <!-- Ventana para agregar usuario -->
                    <div class="windowAddUser">
                        <div class="windowAddUser-content">
                            <span class="closeBtn" onclick="closeAddUserWindow()" style="width: 50px; height: 50px;">&times;</span>
                            <h2>Agregar Nuevo Usuario</h2>
                            <form id="addUserForm" action="../../Functions/dashboardAdmin/addUser.php" method="POST">
                                <label for="username">Nombre de Usuario:</label>
                                <input type="text" id="username" name="username" required>

                                <label for="email">Correo Electrónico:</label>
                                <input type="email" id="email" name="email" required>

                                <label for="role">Rol:</label>
                                <select id="role" name="role" required>
                                    <option value="">Selecciona un rol</option>
                                    <option value="1">Cliente</option>
                                    <option value="2">Administrador</option>
                                    <option value="3">Mozo</option>
                                    <option value="4">Cocinero</option>
                                    <option value="5">Gerente</option>
                                    <option value="6">Delivery</option>
                                </select>

                                <label for="password">Contraseña:</label>
                                <input type="password" id="password" name="password" required>

                                <label for="tel">Teléfono:</label>
                                <input type="tel" id="tel" name="tel" required>

                                <button type="submit" id="btnSubmit">Crear Usuario</button>
                            </form>
                        </div>

                    </div>

                    <div class="dashboard-Users">
                        <div class="search-container">
                            <div class="search-card">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="text" placeholder="Buscar usuario por nombre o email">
                            </div>
                            <div class="searchBTN-card">
                                <button id="searchButton-roles">Todos los roles 
                                    <svg id="searchBTN-card-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="container-table-users">
                            <div id="table-users-header">
                                <i class="fa-solid fa-user-group"></i>
                                <h5>Lista de Usuarios </h5>
                            </div>

                            <div class="table-users-container-table">
                                <table id="table-users" style="width:100%">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Rol</th>
                                            <th>Pedidos</th>
                                            <th>Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        
                                    </tbody>
                                    
                                </table>

                                <div class="optionsTableUsers" style="display: none;">
                                    <div class="optionsTableUsers-content">
                                        <p>Borrar</p>
                                        <p>Eliminar</p>
                                        <p>Borrar</p>
                                        

                                    </div>
                                </div>

                            </div>



                        </div>
                    </div>
                </section>
                <!--=== | DASHBOARD PRODUCTOS | === -->
                <section class="optContent" id="dashboardProductos">
                    <header>
                        <h2 class="optContent-title">Productos</h2>
                    </header>
                </section>
            </main>
        </div>
        <script src="https://cdn.canvasjs.com/canvasjs.min.js"> </script>
        <script src="/proyectoFinal/resources/js/dashboard/adminPanel.js"></script>
        
    </body>
    </html>