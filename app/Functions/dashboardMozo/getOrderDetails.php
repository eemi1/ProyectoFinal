<?php
header("Content-Type: application/json");
$pdo = require "../../../db.php";

$id = $_GET["id"] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "No se envió el id"]);
    exit;
}

try {
    // Pedido
    $sql = $pdo->prepare("SELECT * FROM factura WHERE id = ?");
    $sql->execute([$id]);
    $pedido = $sql->fetch(PDO::FETCH_ASSOC);

    if (!$pedido) {
        echo json_encode(["success" => false, "message" => "Pedido no encontrado"]);
        exit;
    }

    // Productos
    $sql = $pdo->prepare("SELECT p.nombre, d.cantidad, d.precio 
        FROM detalle_factura d
        INNER JOIN producto p ON p.id_producto = d.id_producto
        WHERE id = ?");
    $sql->execute([$id]);
    $items = $sql->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "order" => $pedido,
        "items" => $items
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}