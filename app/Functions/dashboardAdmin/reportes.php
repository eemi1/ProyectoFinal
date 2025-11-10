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

function orders($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT DATE(f.fecha) AS fecha, SUM(df.cantidad) AS total
            FROM detalle_factura df
            JOIN factura f ON f.id = df.id_factura
            GROUP BY DATE(f.fecha)
            ORDER BY fecha ASC
        ");
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $labels = [];
        $values = [];

        foreach ($pedidos as $pedido) {
            $labels[] = $pedido['fecha'];
            $values[] = (int)$pedido['total'];
        }

        $stmtPedidosHoy = $pdo->query("
            SELECT 
                DATE_FORMAT(fecha, '%H:00') AS hora,
                SUM(total) AS totalVentas
            FROM factura
            WHERE estadoPago = 'pagado'
            AND DATE(fecha) = CURDATE()
            GROUP BY HOUR(fecha)
            ORDER BY HOUR(fecha);
        ");
        $pedidosHoy = $stmtPedidosHoy->fetchAll(PDO::FETCH_ASSOC);

        $labels2 = [];
        $values2 = [];

        foreach ($pedidosHoy as $pedidoHoy) {
            $labels2[] = $pedidoHoy['hora'];
            $values2[] = (int)$pedidoHoy['totalVentas'];
        }

        $stmtProductosDestacados = $pdo->query("
            SELECT 
            p.nombre AS producto,
            SUM(df.cantidad) AS total_vendido
            FROM detalle_factura df
            JOIN producto p ON p.id = df.id_producto
            GROUP BY df.id_producto
            ORDER BY total_vendido DESC
            LIMIT 5;
        ");
        $productosDestacados = $stmtProductosDestacados->fetchAll(PDO::FETCH_ASSOC);

        $labels3 = [];
        $values3 = [];

        foreach ($productosDestacados as $prodDestacado) {
            $labels3[] = $prodDestacado['producto'];
            $values3[] = (int)$prodDestacado['total_vendido'];
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
            "labels2" => $labels2,
            "values2" => $values2,
            "labels3" => $labels3,
            "values3" => $values3,
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

        $labels = [];
        $values = [];

        foreach ($data as $row) {
            $labels[] = $row['fecha'];
            $values[] = (int)$row['total'];
        }

        $stmt2 = $pdo->query("
            SELECT estado, COUNT(id) AS totalEstado
            FROM reservas
            GROUP BY estado
            ORDER BY totalEstado DESC
        ");
        $data2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        $labels2 = [];
        $values2 = [];

        foreach ($data2 as $row) {
            $labels2[] = ucfirst($row['estado']); // primera letra mayúscula
            $values2[] = (int)$row['totalEstado'];
        }

        // Calcular el porcentaje de cambio entre el último y el anterior período
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
            "labels2" => $labels2,
            "values2" => $values2,
            "porcentajeCambio" => round($porcentajeCambio, 2)
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener reservas: " . $e->getMessage()
        ]);
    }
}


function reportClients($pdo) {
    try {
        // DATE(f.fecha, '%Y-%m') para agrupar por mes)
        $stmt = $pdo->query("
            SELECT DATE(f.fecha) AS fecha, COUNT(DISTINCT f.id_cliente) AS total
            FROM factura f
            WHERE f.estadoPago = 'pagado'
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

        // Calcular porcentaje de cambio entre el último período y el anterior
        $porcentajeCambio = 0;
        if (count($values) >= 2) {
            $ultimo = end($values);
            $anterior = prev($values);
            if ($anterior > 0) {
                $porcentajeCambio = (($ultimo - $anterior) / $anterior) * 100;
            }
        }

        // Clientes nuevos por mes
        $stmtNuevos = $pdo->query("
        SELECT 
            DATE_FORMAT(DATE(fechaRegistro), '%Y-%m') AS mes,
            COUNT(*) AS nuevos
        FROM usuario
        WHERE fechaRegistro IS NOT NULL
        GROUP BY mes
        ORDER BY mes ASC;
        ");

        $dataNuevos = $stmtNuevos->fetchAll(PDO::FETCH_ASSOC);

        $labelsNuevos = [];
        $valuesNuevos = [];

        foreach ($dataNuevos as $row) {
            $labelsNuevos[] = $row['mes'];
            $valuesNuevos[] = (int)$row['nuevos'];
        }

        $stmtClientesActivos = $pdo->query("
        SELECT DATE(fecha) AS dia, COUNT(DISTINCT id_cliente) AS clientesActivos
        FROM factura
        WHERE estadoPago = 'pagado'
        GROUP BY dia;
        ");

        $clientesActivos = $stmtClientesActivos->fetchAll(PDO::FETCH_ASSOC);

        $labelsActivos = [];
        $valuesActivos = [];

        foreach ($clientesActivos as $row) {
            $labelsActivos[] = $row['dia'];
            $valuesActivos[] = (int)$row['clientesActivos'];
        }

        echo json_encode([
            "success" => true,
            "labels" => $labels,
            "values" => $values,
            "labels2" => $labelsNuevos,
            "values2" => $valuesNuevos,
            "labels3" => $labelsActivos,
            "values3" => $valuesActivos,
            "porcentajeCambio" => round($porcentajeCambio, 2)
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener clientes: " . $e->getMessage()
        ]);
    }
}




function cardsStatsGeneral($pdo) {
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
        SELECT COUNT(DISTINCT u.id) AS clientesUnicos
        FROM usuario u
        JOIN factura f ON f.id_cliente = u.id
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
        orders($pdo);
        break;
    case 'reservas':
        reportReservas($pdo);
        break;
    case 'clientes':
        reportClients($pdo);
        break;
    case 'statsCardsReports':
        cardsStatsGeneral($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        break;
}
