<?php
$host = 'localhost';
$dbname = 'proyectoegreso';
$username = 'root'; // o el usuario que tengas
$password = '';     // tu contraseña

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  die("Conexión fallida: " . $e->getMessage());
}
?>