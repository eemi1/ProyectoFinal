<?php 

include "../../db.php";

$name = $_POST['new-name'];
$email = $_POST['new-email'];
$password = $_POST['new-password'];
$phone = $_POST['new-phone'];
$password_hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)");
$stmt->execute([$name, $email, $password_hash, $phone]);

echo "<a href='../../public/index.html'>Fuiste Registrado correctamente! Haz click en el mensaje para Volver al inicio</a>"
?>