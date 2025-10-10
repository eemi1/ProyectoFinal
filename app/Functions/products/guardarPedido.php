<?php
session_start();
$pdo = require "../../../db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id_usuario = $_SESSION['id_usuario'];
$productos = $data['productos'];
$total = $data['total'];

if (!$id_usuario) {
    echo json_encode(['success' => false, 'message' => 'Usuario no proporcionado']);
    exit;
}

if (empty($productos)) {
    echo json_encode(['success' => false, 'message' => 'No hay productos en el pedido']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO factura (id_usuario, fecha, total) VALUES (?, NOW(), ?)");
    $stmt->execute([$id_usuario, $total]);
    $id_factura = $pdo->lastInsertId();

    $stmtDet = $pdo->prepare("INSERT INTO detalle_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($productos as $prod) {
        $cantidad = $prod['cantidad'] ?? 0;
        $precio = $prod['precio'] ?? 0;
        $subtotal = $cantidad * $precio;

        $stmtDet->execute([$id_factura, $prod['id_producto'], $cantidad, $precio, $subtotal]);
    }
    echo json_encode(['success' => true, 'message' => 'Pedido guardado']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}