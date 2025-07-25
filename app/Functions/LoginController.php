<?php
session_start();
require "../../db.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Validación básica
    if (empty($email) || empty($password)) {
        echo "<script>alert('Todos los campos son obligatorios');window.location.href='login.html';</script>";
        exit();
    }

    // Buscar usuario por email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Éxito: guardar sesión
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        header("Location: ../../public/index.html");
        exit();
    } else {
        echo "<script>alert('Correo o contraseña incorrectos');window.location.href='../../public/login.html';</script>";
        exit();
    }
} else {
    // Acceso por GET (no debería pasar)
    header("Location: ../../public/index.html");
    exit();
}
