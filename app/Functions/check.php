<?php
session_start();
header("Content-Type: application/json");

function verificarSesion() {
    if (isset($_SESSION['usuario'])){
        echo json_encode([
            "success" => true, 
            "message" => "Usuario loggeado.",
            "usuario" => $_SESSION['usuario'],
            "email" => $_SESSION['email'] ?? ''
        
        ]);
            exit;
    }else{
        echo json_encode(["success" => false, "message" => "Usuario no loggeado." ]);
            exit;
    }
}

function cerrarSesion(){
    session_destroy();
    echo json_encode(["success" => "true" , "message" => "Sesión cerrada correctamente"]);
}

function VerificarRutas() {
    
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