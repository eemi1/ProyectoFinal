<?php
session_start();
$pdo = require "../../../db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id_usuario = $_SESSION['id_usuario'];
$productos = $data['productos'];
$total = $data['total'];

try {
    $stmt = $pdo->prepare("INSERT INTO factura (id_usuario, fecha, total) VALUES (?, NOW(), ?)");
    $stmt->execute([$id_usuario, $total]);
    $id_factura = $pdo->lastInsertId();

    $stmtDet = $pdo->prepare("INSERT INTO detalle_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)");
    foreach ($productos as $prod) {
        $subtotal = $prod['cantidad'] * $prod['precio'];
        $stmtDet->execute([$id_factura, $prod['id_producto'], $prod['cantidad'], $prod['precio'], $subtotal]);
    }
    unset($_SESSION['cart']);


    echo json_encode(['success' => true, 'message' => 'Pedido guardado']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}