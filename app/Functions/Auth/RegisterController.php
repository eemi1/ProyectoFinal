<?php
session_start();
header("Content-Type: application/json");
require "../../../db.php"; // tu archivo de conexión PDO

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$password_repeat = $_POST['repeatPassword'] ?? '';
$phone = $_POST['phone'] ?? '';

// Validaciones
if (empty($name) || empty($email) || empty($password) || empty($password_repeat) || empty($phone)) {
    echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios."]);
    exit;
}

if ($password !== $password_repeat) {
    echo json_encode(["success" => false, "message" => "Las contraseñas no coinciden."]);
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

    if (["success"] == true ){
    $stmt = $pdo->prepare("INSERT INTO usuario (nombreCompleto, mail, contraseña, telefono) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password_hash, $phone]);
    echo json_encode(["success" => true, "message" => "Usuario registrado correctamente."]);
    }else{
        return;
    };
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error al registrar: " . $e->getMessage()]);
}