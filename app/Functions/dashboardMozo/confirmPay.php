<?php
session_start();
$pdo = require "../../../db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id_factura'] ?? null;
$mesa = $data['mesa'] ?? null;
$metodo = $data['metodoPago'] ?? 'efectivo';

if (!$id || !$mesa) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

try {
    $pdo->beginTransaction();

    // marcar como pagada
    $stmt = $pdo->prepare("
        UPDATE factura 
        SET estadoPago='pagado', estado='Entregado', metodoPago=? 
        WHERE id=?
    ");
    $stmt->execute([$metodo, $id]);

    // liberar mesa
    $stmt2 = $pdo->prepare("UPDATE mesa SET estado='disponible' WHERE id=?");
    $stmt2->execute([$mesa]);

    $pdo->commit();

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
