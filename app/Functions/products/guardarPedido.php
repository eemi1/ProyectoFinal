<?php
session_start();
$pdo = require "../../../db.php";

header("Content-Type: application/json");

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión para realizar un pedido.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id_usuario = $_SESSION['id_usuario'];
$productos = $data['productos'] ?? [];
$total = $data['total'] ?? 0;
$id_direccion = $data['id_direccion'] ?? null;
$metodoEntrega = $data['metodoEntrega'] ?? 'Sin definir entrega'; // 'envio' o 'retiro'
$metodoPago = $data['metodoPago'] ?? 'Sin metodo de pago'; // 'efectivo' o 'tarjeta'
$estadoPago = $data['estadoPago'] ?? 'Sin estado de pago';
$estado = 'Pendiente';

if (empty($productos)) {
    echo json_encode(['success' => false, 'message' => 'No hay productos en el pedido']);
    exit;
}

try {
    // Iniciar transacción
    $pdo->beginTransaction();

    $codigo = 'PED-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));

    // 1️⃣ Guardar factura
    $stmt = $pdo->prepare("INSERT INTO factura (id_cliente, fecha, total, codigo, id_direccion, metodoEntrega, metodoPago, estadoPago, estado) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id_usuario, $total, $codigo, $id_direccion, $metodoEntrega, $metodoPago, $estadoPago, $estado]);
    $id_factura = $pdo->lastInsertId();

    // 2️⃣ Guardar detalle de productos
    $stmtDet = $pdo->prepare("INSERT INTO detalle_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal)VALUES (?, ?, ?, ?, ?)");
    
    foreach ($productos as $producto) {
        if (!isset($producto['id_producto'], $producto['cantidad'], $producto['precio'], $producto['subtotal'])) {
            json_encode(["success"=>false, "message"=>'Datos incompletos en el producto']);
        }

        $id_producto = (int)$producto['id_producto'];
        $cantidad = (int)$producto['cantidad'];
        $precio_unitario = (float)$producto['precio'];
        $subtotal = round((float)$producto['subtotal'], 2); 

        $stmtDet->execute([$id_factura, $id_producto, $cantidad, $precio_unitario, $subtotal]);
    }

    // 5️⃣ Confirmar todo
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Pedido guardado']);

}catch (Exception $e) {
    $pdo->rollBack();
    error_log("Error pedido: " . $e->getMessage()); 
    echo json_encode(['success' => false, 'message' => 'Hubo un problema al procesar tu pedido.'. $e->getMessage()]);
}