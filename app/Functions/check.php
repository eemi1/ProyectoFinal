<?php
session_start();
header("Content-Type: application/json");

function verificarSesion() {
    if (isset($_SESSION['usuario'])){
        echo json_encode(["success" => true]);
            exit;
    }else{
        echo json_encode(["success" => false]);
            exit;
    }
}

function cerrarSesion(){
    session_destroy();
    echo json_encode(["success" => "logueo exitoso"]);
}

// RUTEO
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'verificar':
        verificarSesion();
        break;
    case 'cerrar':
        cerrarSesion();
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}