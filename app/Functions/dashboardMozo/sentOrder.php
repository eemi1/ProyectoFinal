<?php
session_start();
$pdo = require "../../../db.php";

header("Content-Type: application/json");

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión para realizar un pedido.']);
    exit;
}

$id_mozo = $_SESSION['id_usuario'];

$id_cliente_salon = 52;  

$data = json_decode(file_get_contents("php://input"), true);

$mesa = $data['mesa'] ?? null;
$productos = $data['items'] ?? [];
$subtotal = $data['subtotal'] ?? 0;
$total = $data['total'] ?? 0;

if (!$mesa || empty($productos)) {
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos para generar el pedido.'
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    $codigo = 'PED-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));

    $stmtFactura = $pdo->prepare("
        INSERT INTO factura (
            id_cliente, id_mesa, codigo, fecha, total, estado, metodoPago, estadoPago, metodoEntrega
        ) VALUES (
            ?, ?, ?, NOW(), ?, 'Pendiente', 'efectivo', 'pendiente', 'local'
        )
    ");
    $stmtFactura->execute([$id_cliente_salon, $mesa, $codigo, $total]);

    $id_factura = $pdo->lastInsertId();

    $stmtDet = $pdo->prepare("
        INSERT INTO detalle_factura (
            id_factura, id_producto, cantidad, precio_unitario, subtotal
        ) VALUES (?, ?, 1, ?, ?)
    ");

    foreach ($productos as $p) {
        $stmtDet->execute([
            $id_factura,
            $p['id'],
            $p['precio'],
            $p['precio']
        ]);
    }

    $stmtPedido = $pdo->prepare("
        INSERT INTO pedido (id_factura, id_mozo, hora_inicio)
        VALUES (?, ?, NOW())
    ");
    $stmtPedido->execute([$id_factura, $id_mozo]);

    // 4️⃣ ACTUALIZAR MESA
    $pdo->prepare("UPDATE mesa SET estado = 'ocupada' WHERE numero = ?")
        ->execute([$mesa]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'codigo' => $codigo,
        'id_factura' => $id_factura
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => "Error: " . $e->getMessage()
    ]);
}
