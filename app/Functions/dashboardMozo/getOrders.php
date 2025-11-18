<?php
session_start();
header("Content-Type: application/json");
$pdo = require "../../../db.php";

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode([
        "success" => false,
        "message" => "Acceso no autorizado."
    ]);
    exit;
}

$id_mozo = $_SESSION['id_usuario'];   // SOLO PEDIDOS DEL MOZO
$estado = $_GET['estado'] ?? 'todas';

try {

    $sql = "
        SELECT 
            f.id AS id_factura,
            f.codigo,
            f.id_mesa,
            f.fecha,
            f.total,
            f.estado,
            p.id_mozo
        FROM factura f
        JOIN pedido p ON p.id_factura = f.id
        WHERE p.id_mozo = :id_mozo
    ";

    if ($estado !== 'todas') {
        $sql .= " AND f.estado = :estado ";
    }

    $sql .= " ORDER BY f.fecha DESC ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(":id_mozo", $id_mozo, PDO::PARAM_INT);

    if ($estado !== 'todas') {
        $stmt->bindValue(":estado", $estado);
    }

    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        $stmt2 = $pdo->prepare("
            SELECT 
                df.id_producto,
                df.cantidad,
                df.subtotal,
                p.nombre AS nombre_producto
            FROM detalle_factura df
            JOIN producto p ON p.id = df.id_producto
            WHERE df.id_factura = :id
        ");

        $stmt2->execute(['id' => $order['id_factura']]);
        $order['detalles'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        "success" => true,
        "data" => $orders
    ]);
    exit;

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
    exit;
}
