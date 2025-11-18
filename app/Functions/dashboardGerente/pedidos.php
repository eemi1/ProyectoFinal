<?php
session_start();
header("Content-Type: application/json");
$pdo = require "../../../db.php";

function getOrders($pdo) {
    try {

        $estado = $_GET['estado'] ?? 'todas';

        $sql = "SELECT 
                f.id, 
                f.id_cliente, 
                u.nombreCompleto AS nombreCliente,
                f.codigo, 
                f.id_direccion, 
                f.fecha, 
                f.estado, 
                f.metodoPago, 
                f.estadoPago,
                f.metodoEntrega
            FROM factura f
            JOIN usuario u ON f.id_cliente = u.id
            WHERE DATE(f.fecha) = CURDATE()";

        if ($estado !== 'todas') {
            $sql .= " WHERE estado = :estado";
        }

        $sql .= " ORDER BY 
                    CASE 
                        WHEN estado = 'Pendiente' THEN 1
                        WHEN estado = 'Preparando' THEN 2
                        WHEN estado = 'Lista' THEN 3
                        WHEN estado = 'Entregado' THEN 4
                        ELSE 5
                    END,
                    fecha DESC";

        $stmt = $pdo->prepare($sql);

        if ($estado !== 'todas') {
            $stmt->bindParam(':estado', $estado);
        }

        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($orders)) {
            echo json_encode(["success" => true, "data" => [], "message" => "No hay pedidos disponibles"]);
            exit;
        }

        foreach ($orders as &$order) {
            // Detalles del pedido
            $stmtDetails = $pdo->prepare("
                SELECT 
                    df.id, 
                    df.id_factura, 
                    df.id_producto, 
                    df.cantidad, 
                    df.subtotal,
                    p.nombre AS nombre_producto,
                    p.descripcion,
                    p.tiempoPreparacion,
                    p.calorias
                FROM detalle_factura df
                JOIN producto p ON df.id_producto = p.id
                WHERE df.id_factura = :id_factura
            ");
            $stmtDetails->execute(['id_factura' => $order['id']]);
            $details = $stmtDetails->fetchAll(PDO::FETCH_ASSOC);

            $order['detalles'] = $details;


            // Datos del pedido (tiempo + inicio)
            $stmtPedido = $pdo->prepare("
                SELECT hora_inicio, tiempo_estimado
                FROM pedido
                WHERE id_factura = :id
                LIMIT 1
            ");
            $stmtPedido->execute(['id' => $order['id']]);
            $pedidoData = $stmtPedido->fetch(PDO::FETCH_ASSOC);

            if ($pedidoData) {
                $horaInicio = strtotime($pedidoData['hora_inicio']);
                $tiempoEstimado = intval($pedidoData['tiempo_estimado']); // minutos
                $horaLimite = $horaInicio + ($tiempoEstimado * 60);
                $horaActual = time();
            
                $order['atrasado'] = (
                    $order['estado'] === 'Preparando'
                    && $horaActual > $horaLimite
                );
            } else {
                $order['atrasado'] = false;
            }
        }

        $totalLate = 0;
        foreach ($orders as $o) {
            if ($o['atrasado']) $totalLate++;
        }

        

        $stmt2 = $pdo->prepare("SELECT COUNT(id) as total FROM factura WHERE DATE(fecha) = CURDATE()");
        $stmt2->execute();
        $totalOrders = $stmt2->fetchColumn();

        $stmt3 = $pdo->prepare("SELECT COUNT(id) as total FROM factura WHERE estado = 'Pendiente' AND DATE(fecha) = CURDATE()");
        $stmt3->execute();
        $totalPending = $stmt3->fetchColumn();

        $stmt4 = $pdo->prepare("SELECT COUNT(id) as total FROM factura WHERE estado = 'Preparando' AND DATE(fecha) = CURDATE()");
        $stmt4->execute();
        $totalPreparing = $stmt4->fetchColumn();

        $stmt5 = $pdo->prepare("SELECT COUNT(id) as total FROM factura WHERE estado = 'Lista' AND DATE(fecha) = CURDATE()");
        $stmt5->execute();
        $totalList = $stmt5->fetchColumn();

        $stmt6 = $pdo->prepare("SELECT COUNT(id) as total FROM factura WHERE estado = 'Entregado' AND DATE(fecha) = CURDATE()");
        $stmt6->execute();
        $totalSent = $stmt6->fetchColumn();

        echo json_encode([
            "success" => true, 
            "data" => $orders,
            "totalOrders" => $totalOrders,
            "totalPending" => $totalPending,
            "totalPreparing" => $totalPreparing,
            "totalList" => $totalList,
            "totalSent" => $totalSent,
            "totalLate" => $totalLate 

        ]);
        exit;

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener los pedidos: " . $e->getMessage()
        ]);
        exit;
    }
}

function preparingOrder($pdo) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID de pedido no recibido."]);
            exit;
        }

        $pdo->beginTransaction();

        // Productos de la factura
        $stmt = $pdo->prepare("SELECT id_producto, cantidad FROM detalle_factura WHERE id_factura = :id");
        $stmt->execute(['id' => $id]);
        $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($detalles)) {
            throw new Exception("No se encontraron productos para esta factura.");
        }

        // Consultas reutilizables
        $stmtIngredientes = $pdo->prepare("
            SELECT id_ingrediente, cantidad 
            FROM producto_ingrediente 
            WHERE id_producto = :id_producto
        ");

        $stmtStock = $pdo->prepare("
            UPDATE ingrediente 
            SET stock_actual = stock_actual - :cantidad_usar
            WHERE id = :id_ingrediente
        ");

        $stmtCheckStock = $pdo->prepare("
            SELECT stock_actual 
            FROM ingrediente 
            WHERE id = :id_ingrediente
        ");


        // Descontar ingredientes según los productos
        foreach ($detalles as $detalle) {
            $idProducto = $detalle['id_producto'];
            $cantidadProducto = $detalle['cantidad'];

            $stmtIngredientes->execute(['id_producto' => $idProducto]);
            $ingredientes = $stmtIngredientes->fetchAll(PDO::FETCH_ASSOC);

            foreach ($ingredientes as $ing) {
                $idIng = $ing['id_ingrediente'];
                $cantPorUnidad = $ing['cantidad'];
                $totalUsar = $cantPorUnidad * $cantidadProducto;

                // Verificar stock disponible
                $stmtCheckStock->execute(['id_ingrediente' => $idIng]);
                $stockActual = $stmtCheckStock->fetchColumn();

                if ($stockActual === false) {
                    throw new Exception("Ingrediente ID {$idIng} no encontrado en base de datos.");
                }

                if ($stockActual < $totalUsar) {
                    throw new Exception("Stock insuficiente del ingrediente ID {$idIng}. Disponible: {$stockActual}, requerido: {$totalUsar}.");
                }

                // Descontar stock
                $stmtStock->execute([
                    'cantidad_usar' => $totalUsar,
                    'id_ingrediente' => $idIng
                ]);
            }
        }
        // Calcular tiempo estimado
        $tiempoMaximo = 0;

        $tiempoStmt = $pdo->prepare("
            SELECT p.tiempoPreparacion, df.cantidad
            FROM detalle_factura df
            JOIN producto p ON df.id_producto = p.id
            WHERE df.id_factura = :id
        ");
        $tiempoStmt->execute(['id' => $id]);
        $tiempos = $tiempoStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($tiempos as $t) {
            $tiempoPlato = intval($t['tiempoPreparacion']); 
            $cantidad = intval($t['cantidad']);
        
            // Tiempo total por producto (si piden 3 hamburguesas, demora más)
            $tiempoTotalProducto = $tiempoPlato * $cantidad;
        
            if ($tiempoTotalProducto > $tiempoMaximo) {
                $tiempoMaximo = $tiempoTotalProducto;
            }
        }



        // Actualizar estado de la factura
        $stmt = $pdo->prepare("UPDATE factura SET estado = 'Preparando' WHERE id = :id");
        $stmt->execute(['id' => $id]);

        // Crear el pedido 

        $stmtPedido = $pdo->prepare("
            INSERT INTO pedido (id_factura, id_mozo, id_chef, hora_inicio, tiempo_estimado)
            VALUES (:id_factura, :id_mozo, :id_chef, NOW(), :tiempo_estimado)
        ");
        $idUsuario = $_SESSION['id_usuario'] ?? null;
        $rolUsuario = $_SESSION['rol'] ?? null;

        $idMozo = null;
        $idChef = null;

        if ($rolUsuario === 'mozo') {
            $idMozo = $idUsuario;
        } elseif ($rolUsuario === 'chef') {
            $idChef = $idUsuario;
        }

        // También podés permitir asignarlos manualmente desde frontend:
        // $idMozo = $data['id_mozo'] ?? $idMozo;
        // $idChef = $data['id_chef'] ?? $idChef;

        $stmtPedido->execute([
            'id_factura' => $id,
            'id_mozo' => $idMozo,
            'id_chef' => $idChef,
            'tiempo_estimado' => $tiempoMaximo

        ]);

        // Confirmar transacción
        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" => "Pedido confirmado y stock de ingredientes actualizado correctamente."
        ]);
        exit;

    } catch (Exception $e) {
        // Revertir si algo falla
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        echo json_encode([
            "success" => false,
            "message" => "Error al confirmar pedido: " . $e->getMessage()
        ]);
        exit;
    }
}

function cancelOrder($pdo) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID no proporcionado"]);
            exit;
        }
        // Inicio de la transacción
        $pdo->beginTransaction();

        // Detalles del producto
        $stmt = $pdo->prepare("SELECT id_producto, cantidad FROM detalle_factura WHERE id_factura = :id_factura");
        $stmt->execute(['id_factura' => $id]);
        $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($detalles)) {
            echo json_encode(["success" => false, "message" => "No se encontraron detalles para esta factura"]);
            $pdo->rollBack();
            return;
        }

        // Buscar los ingredientes de cada producto
        $stmtIng = $pdo->prepare("
            SELECT id_ingrediente, cantidad 
            FROM producto_ingrediente
            WHERE id_producto = :id_producto
        ");
            
        foreach ($detalles as $detalle) {
            $stmtIng->execute(['id_producto' => $detalle['id_producto']]);
            $ingredientes = $stmtIng->fetchAll(PDO::FETCH_ASSOC);
        
            foreach ($ingredientes as $ing) {
                $stmtUpd = $pdo->prepare("
                    UPDATE ingrediente
                    SET stock_actual = stock_actual + (:cantidad_detalle * :cantidad_ingrediente)
                    WHERE id = :id_ingrediente
                ");
                $stmtUpd->execute([
                    'cantidad_detalle' => $detalle['cantidad'],
                    'cantidad_ingrediente' => $ing['cantidad'],
                    'id_ingrediente' => $ing['id_ingrediente']
                ]);
            }
        }

        $stmt2 = $pdo->prepare("UPDATE factura SET estado = 'Cancelado' WHERE id = :id");
        $stmt2->execute(['id' => $id]);

        $pdo->commit();

        
        echo json_encode([
            "success" => true,
            "message" => "Pedido cancelado y stock restaurado correctamente"
        ]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

function listOrder($pdo) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID no proporcionado"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE factura SET estado = 'Lista' WHERE id = :id");
        $stmt->execute(['id' => $id]);

        echo json_encode([
            "success" => $stmt->rowCount() > 0,
            "message" => $stmt->rowCount() > 0 ? "Pedido marcado como listo" : "No se encontró el pedido"
        ]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

function sentOrder($pdo) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID no proporcionado"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE factura SET estado = 'Entregado' WHERE id = :id");
        $stmt->execute(['id' => $id]);

        echo json_encode([
            "success" => $stmt->rowCount() > 0,
            "message" => $stmt->rowCount() > 0 ? "Pedido marcado como entregado" : "No se encontró el pedido"
        ]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

function markAsPaid($pdo) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID no proporcionado"]);
            exit;
        }

        // Actualizar el estado de pago
        $stmt = $pdo->prepare("UPDATE factura SET estadoPago = 'pagado' WHERE id = :id");
        $stmt->execute(['id' => $id]);

        echo json_encode([
            "success" => $stmt->rowCount() > 0,
            "message" => $stmt->rowCount() > 0 
                ? "Pago confirmado correctamente." 
                : "No se encontró la factura o ya estaba pagada."
        ]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error al confirmar pago: " . $e->getMessage()]);
    }
}


if (!isset($_SESSION['usuario']) || !isset($_SESSION['id_rol'])) {
    echo json_encode(["success" => false, "message" => "Sesión no iniciada o inválida"]);
    exit;
}

$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'getOrders':
        getOrders($pdo);
        break;
    case 'preparingOrder':
        preparingOrder($pdo);
        break;
    case 'cancelOrder':
        cancelOrder($pdo);
        break;
    case 'listOrder':
        listOrder($pdo);
        break;
    case 'sentOrder':
        sentOrder($pdo);
        break;
    case 'markAsPaid':
        markAsPaid($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        break;
}
