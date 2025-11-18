<?php
session_start();
$pdo = require "../../../db.php";

$id_mozo = $_SESSION['id_usuario'];

$sql = "
    SELECT DISTINCT f.id_mesa AS id_mesa
    FROM factura f
    JOIN pedido p ON p.id_factura = f.id
    WHERE f.estadoPago = 'pendiente'
      AND p.id_mozo = ?
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$id_mozo]);
$mesas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "mesas" => $mesas
]);
