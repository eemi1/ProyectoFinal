<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode([
        "success" => false,
        "message" => "No hay sesión activa"
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "usuario" => $_SESSION['usuario'] ?? '',
    "email" => $_SESSION['email'] ?? '',
    "tel" => $_SESSION['tel'] ?? '',
    "fechaNacimiento" => $_SESSION['fechaNacimiento'] ?? '',
    "id_rol" => $_SESSION['id_rol'] ?? ''
]);