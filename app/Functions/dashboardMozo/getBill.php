<?php
session_start();
$pdo = require "../../../db.php";

$mesa = $_GET['mesa'] ?? null;
$id_mozo = $_SESSION['id_usuario'];

$sql = "
    SELECT f.id, f.total
    FROM factura f
    JOIN pedido p ON p.id_factura = f.id
    WHERE f.id_mesa = ?
      AND p.id_mozo = ?
      AND f.estadoPago = 'pendiente'
    ORDER BY f.id DESC LIMIT 1
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$mesa, $id_mozo]);
$factura = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$factura) {
    echo json_encode(["success" => false, "message" => "No existe factura para esta mesa."]);
    exit;
}

// Obtener detalle de factura
$stmt2 = $pdo->prepare("
    SELECT df.id_producto, df.cantidad, df.subtotal, p.nombre AS nombre_producto
    FROM detalle_factura df
    JOIN producto p ON p.id = df.id_producto
    WHERE df.id_factura = ?
");
$stmt2->execute([$factura['id']]);
$detalles = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// Calcular subtotal real
$subtotal = array_sum(array_column($detalles, 'subtotal'));

echo json_encode([
    "success" => true,
    "id_factura" => $factura['id'],
    "subtotal" => $subtotal,
    "descuento" => 0,
    "propina" => 0,
    "total" => $factura['total'],
    "detalles" => $detalles
]);
