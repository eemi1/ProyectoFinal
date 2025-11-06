<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta será en formato JSON
$pdo = require "../../../db.php";

function chartTotalSales($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT DATE(fecha) AS fecha, SUM(total) AS total FROM factura WHERE estadoPago = 'pagado' GROUP BY DATE(fecha) ORDER BY fecha ASC");
        $stmt->execute(); 

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $labels = [];
        $values = [];

        foreach ($data as $row) {
            $labels[] = $row['fecha'];
            $values[] = $row['total'];
        }

        $porcentajeCambio = 0;
        if (count($values) >= 2) {
            $ultimo = end($values);
            $anterior = prev($values);
            if ($anterior > 0) {
                $porcentajeCambio = (($ultimo - $anterior) / $anterior) * 100;
            }
        }

        echo json_encode([
            "success" => true,
            "labels" => $labels,
            "values" => $values,
            "porcentajeCambio" => round($porcentajeCambio, 2)
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener datos de ventas: " . $e->getMessage()
        ]);
    }
}

function ordersDay($pdo) {
    try {
        // Obtenemos la cantidad vendida por producto por día
        $stmt = $pdo->query("
            SELECT DATE(f.fecha) AS fecha, SUM(df.cantidad) AS total
            FROM detalle_factura df
            JOIN factura f ON f.id = df.id_factura
            GROUP BY DATE(f.fecha)
            ORDER BY fecha ASC
        ");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $labels = [];
        $values = [];

        foreach ($data as $row) {
            $labels[] = $row['fecha'];
            $values[] = (int)$row['total'];
        }

        // Calculamos porcentaje de cambio entre el último día y el anterior
        $porcentajeCambio = 0;
        if (count($values) >= 2) {
            $ultimo = end($values);
            $anterior = prev($values);
            if ($anterior > 0) {
                $porcentajeCambio = (($ultimo - $anterior) / $anterior) * 100;
            }
        }

        echo json_encode([
            "success" => true,
            "labels" => $labels,
            "values" => $values,
            "porcentajeCambio" => round($porcentajeCambio, 2)
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener productos: " . $e->getMessage()
        ]);
    }
}

function reportReservas($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT DATE(fechaReserva) AS fecha, COUNT(*) AS total
            FROM reservas
            GROUP BY DATE(fechaReserva)
            ORDER BY fecha ASC
        ");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "labels" => array_column($data, 'fecha'),
            "values" => array_column($data, 'total')
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener reservas: " . $e->getMessage()
        ]);
    }
}

function reportInventario($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT nombre, stock_actual, stock_minimo
            FROM ingrediente
            WHERE stock_actual <= stock_minimo
            ORDER BY stock_actual ASC
        ");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $data
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener inventario: " . $e->getMessage()
        ]);
    }
}

function statsCardsReports($pdo) {
    try {
        // Ingresos totales
        $stmtVentas = $pdo->query("
            SELECT SUM(total) AS total
            FROM factura
            WHERE estadoPago = 'pagado'
        ");
        $ventas = $stmtVentas->fetchAll(PDO::FETCH_ASSOC);

        // Total de pedidos
        $stmtPedidos = $pdo->query("
            SELECT COUNT(id) AS pedidosTotales
            FROM factura
            WHERE estado IN ('Entregado', 'Lista')
        ");
        $pedidos = $stmtPedidos->fetchAll(PDO::FETCH_ASSOC);

        // Clientes únicos totales
        $stmtClientes = $pdo->query("
            SELECT COUNT(DISTINCT id_cliente) AS clientesUnicos
            FROM factura
            WHERE estadoPago = 'pagado'
        ");
        $clientes = $stmtClientes->fetchAll(PDO::FETCH_ASSOC);
        
        //Total de reservas
        $stmtReservas = $pdo->query("
            SELECT COUNT(id) AS reservasTotales
            FROM reservas
            WHERE estado = 'Confirmado'
            ");
            $reservas = $stmtReservas->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "ventas" => $ventas,
            "pedidos" => $pedidos,
            "clientes" => $clientes,
            "reservas" => $reservas
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener estadísticas: " . $e->getMessage()
        ]);
    }
}


$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'ventas':
        chartTotalSales($pdo);
        break;
    case 'pedidos':
        ordersDay($pdo);
        break;
    case 'reservas':
        reportReservas($pdo);
        break;
    case 'inventario':
        reportInventario($pdo);
        break;
    case 'statsCardsReports':
        statsCardsReports($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        break;
}
