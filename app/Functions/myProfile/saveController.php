<?php
session_start();
header("Content-Type: application/json");
require "../../../db.php";

if(!isset($_SESSION['usuario'])){
    echo json_encode([
        "success" => false,
        "message" => "No hay usuario autenticado"
    ]);
    exit;
}

$email = $_SESSION['email'] ?? '';

$name = $_POST['nombreCompleto'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$fechaNacimiento = $_POST['fechaNacimiento'] ?? '';

try {
    $stmt = $pdo->prepare("UPDATE usuario SET nombreCompleto = :nombreCompleto, telefono = :telefono, fechaNacimiento = :fechaNacimiento WHERE mail = :email");
    $stmt->execute([
        ':email' => $email,
        ':telefono' => $telefono,
        ':fechaNacimiento' => $fechaNacimiento,
        ':nombreCompleto' => $name
    ]);

    $stmt = $pdo->prepare("SELECT * FROM usuario WHERE mail = :email");
    $stmt->execute([':email' => $email]);
    $resultados = $stmt->fetch(PDO::FETCH_ASSOC);

    $_SESSION["usuario"] = $resultados["nombreCompleto"];
    $_SESSION["tel"] = $resultados["telefono"];
    $_SESSION["fechaNacimiento"] = $resultados["fechaNacimiento"];

    echo json_encode([
        "success" => true,
        "message" => "Perfil actualizado correctamente",
        "usuarios" => $resultados
    ]);
    exit;
} catch(PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar: " . $e->getMessage()
    ]);
    exit;
}