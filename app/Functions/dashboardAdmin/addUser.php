<?php
session_start();
header("Content-Type: application/json");
require "../../../db.php"; // tu archivo de conexión PDO

$name = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$telefono = $_POST['tel'] ?? '';
$rol_id = $_POST['role'] ?? 1; // Valor por defecto 1 (Cliente)
$int_rol_id = (int)$rol_id;

// Validaciones
if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios."]);
    exit;
}

try{
    $stmt = $pdo->prepare("SELECT * from usuario where mail = ? ");
    $stmt->execute([$email]);
    $valor = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($valor){
        echo json_encode(["success" => false, "message" => "El gmail ya esta registrado a una cuenta."]);
        exit;
    }

}catch(PDOException $e){
    echo "$e";
}

// Hash de la contraseña
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Guardar en la base de datos
try {
    $stmt = $pdo->prepare("INSERT INTO usuario (nombreCompleto, mail, contraseña, telefono, id_rol) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password_hash, $telefono, $int_rol_id]);

    echo json_encode(["success" => true, "message" => "Nuevo usuario agregado correctamente: "]);
    exit;

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error al registrar: " . $e->getMessage()]);
}