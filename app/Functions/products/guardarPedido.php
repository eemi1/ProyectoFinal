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

if (empty($productos)) {
    echo json_encode(['success' => false, 'message' => 'No hay productos en el pedido']);
    exit;
}

try {
    // Iniciar transacción
    $pdo->beginTransaction();

    $codigo = 'PED-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));

    // 1️⃣ Guardar factura
    $stmt = $pdo->prepare("INSERT INTO factura (id_cliente, fecha, total, codigo, id_direccion) VALUES (?, NOW(), ?, ?, ?)");
    $stmt->execute([$id_usuario, $total, $codigo, $id_direccion]);
    $id_factura = $pdo->lastInsertId();

    // 2️⃣ Guardar detalle de productos
    $stmtDet = $pdo->prepare("
        INSERT INTO detalle_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($productos as $prod) {
        $id_producto = $prod['id_producto'];
        $cantidad = $prod['cantidad'] ?? 0;
        $precio = $prod['precio'] ?? 0;
        $subtotal = $cantidad * $precio;

        $stmtDet->execute([$id_factura, $id_producto, $cantidad, $precio, $subtotal]);

        // 3️⃣ Buscar ingredientes asociados al producto
        $stmtIng = $pdo->prepare("
            SELECT id_ingrediente, cantidad 
            FROM producto_ingrediente 
            WHERE id_producto = ?
        ");
        $stmtIng->execute([$id_producto]);
        $ingredientes = $stmtIng->fetchAll(PDO::FETCH_ASSOC);

        // 4️⃣ Restar stock de cada ingrediente
        foreach ($ingredientes as $ing) {
            $id_ingrediente = $ing['id_ingrediente'];
            $gramosNecesarios = $ing['cantidad'] * $cantidad;

            // Verificar stock actual
            $stmtStock = $pdo->prepare("SELECT stock_actual  FROM ingrediente WHERE id = ?");
            $stmtStock->execute([$id_ingrediente]);
            $stock = $stmtStock->fetchColumn();

            if ($stock === false) {
                throw new Exception("Ingrediente ID $id_ingrediente no encontrado.");
            }

            if ($stock < $gramosNecesarios) {
                throw new Exception("Stock insuficiente del ingrediente ID $id_ingrediente. Stock actual: $stock g, necesita: $gramosNecesarios g.");
            }
            

            // Actualizar stock
            $stmtUpd = $pdo->prepare("UPDATE ingrediente SET stock_actual  = stock_actual  - ? WHERE id = ?");
            $stmtUpd->execute([$gramosNecesarios, $id_ingrediente]);
        }
    }

    // 5️⃣ Confirmar todo
    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Pedido guardado y stock actualizado correctamente.']);

}catch (Exception $e) {
    $pdo->rollBack();
    error_log("Error pedido: " . $e->getMessage()); 
    echo json_encode(['success' => false, 'message' => 'Hubo un problema al procesar tu pedido.'. $e->getMessage()]);
}