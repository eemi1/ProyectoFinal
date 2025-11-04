<?php
session_start();
header("Content-Type: application/json");
$pdo = require "../../../db.php";

function getOrders($pdo) {
    try {
        // Traer los pedidos y el nombre del cliente
        $stmt = $pdo->prepare("
            SELECT 
                f.id, 
                f.id_cliente, 
                u.nombreCompleto AS nombreCliente,
                f.codigo, 
                f.id_direccion, 
                f.fecha, 
                f.estado, 
                f.metodoPago, 
                f.metodoEntrega
            FROM factura f
            JOIN usuario u ON f.id_cliente = u.id
            ORDER BY f.fecha DESC
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
        }

        echo json_encode(["success" => true, "data" => $orders]);
        exit;

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener los pedidos: " . $e->getMessage()
        ]);
        exit;
    }
}

function confirmOrder($pdo) {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID de pedido no recibido."]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE factura SET estado = 'Preparando' WHERE id = :id");
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Pedido confirmado correctamente"]);
        } else {
            echo json_encode(["success" => false, "message" => "No se encontró el pedido"]);
        }
    } catch (Exception $e) {
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

        $stmt = $pdo->prepare("UPDATE factura SET estado = 'Cancelado' WHERE id = :id");
        $stmt->execute(['id' => $id]);

        echo json_encode([
            "success" => $stmt->rowCount() > 0,
            "message" => $stmt->rowCount() > 0 ? "Pedido cancelado correctamente" : "No se encontró el pedido"
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
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'getOrders':
        getOrders($pdo);
        break;
    case 'confirmOrder':
        confirmOrder($pdo);
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
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        break;
}
