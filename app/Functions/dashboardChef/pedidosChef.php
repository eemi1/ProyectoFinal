<?php
session_start();
header("Content-Type: application/json");

$pdo = require "../../../db.php";

if (!isset($_SESSION['id_usuario']) || ($_SESSION['id_rol'] != 4 && $_SESSION['id_rol'] != 2)) {
    echo json_encode(["success" => false, "message" => "Acceso no autorizado."]);
    exit;
}

$id_chef = $_SESSION['id_usuario'];
$accion = $_GET["action"] ?? null;

/* ============================================================
   LISTAR PEDIDOS
============================================================ */
if ($accion === "getOrders") {

    $estado = $_GET["estado"] ?? "todas";

    try {

        $sql = "
            SELECT 
                f.id AS id_factura,
                f.codigo,
                f.fecha,
                f.total,
                f.estado,
                p.id AS id_pedido,
                p.tiempo_estimado,
                p.hora_inicio
            FROM factura f
            JOIN pedido p ON p.id_factura = f.id
            WHERE f.estado != 'Cancelado'
        ";

        if ($estado !== "todas") {
            $sql .= " AND f.estado = :estado ";
        }

        $sql .= " ORDER BY f.fecha DESC";

        $stmt = $pdo->prepare($sql);

        if ($estado !== "todas") {
            $stmt->bindValue(":estado", $estado);
        }

        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($orders as &$o) {

            $stmt2 = $pdo->prepare("
                SELECT 
                    df.id_producto,
                    df.cantidad,
                    df.subtotal,
                    p.nombre AS nombre_producto
                FROM detalle_factura df
                JOIN producto p ON p.id = df.id_producto
                WHERE df.id_factura = ?
            ");
            $stmt2->execute([$o["id_factura"]]);

            $o["detalles"] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            "success" => true,
            "data" => $orders,
            "totalOrders" => count($orders),
            "totalPending" => count(array_filter($orders, fn($x) => $x["estado"] === "Pendiente")),
            "totalPreparing" => count(array_filter($orders, fn($x) => $x["estado"] === "Preparando")),
            "totalList" => count(array_filter($orders, fn($x) => $x["estado"] === "Lista")),
            "totalSent" => count(array_filter($orders, fn($x) => $x["estado"] === "Entregado"))
        ]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

    exit;
}

/* ============================================================
   VALIDAR PEDIDO
============================================================ */
function validarPedido($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM factura WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/* ============================================================
   PENDIENTE → PREPARANDO
============================================================ */
if ($accion === "preparingOrder") {

    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data["id_factura"] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "ID no recibido"]);
        exit;
    }

    try {

        $factura = validarPedido($pdo, $id);
        if (!$factura) throw new Exception("Factura no encontrada");

        $stmt = $pdo->prepare("
            SELECT p.tiempoPreparacion, df.cantidad
            FROM detalle_factura df
            JOIN producto p ON p.id = df.id_producto
            WHERE df.id_factura = ?
        ");
        $stmt->execute([$id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $tiempo = 0;
        foreach ($rows as $r) {
            $calc = $r["tiempoPreparacion"] * $r["cantidad"];
            if ($calc > $tiempo) $tiempo = $calc;
        }

        $pdo->beginTransaction();

        $pdo->prepare("UPDATE factura SET estado = 'Preparando' WHERE id = ?")
            ->execute([$id]);

        $pdo->prepare("
            UPDATE pedido 
            SET id_chef = ?, hora_inicio = NOW(), tiempo_estimado = ?
            WHERE id_factura = ?
        ")->execute([$id_chef, $tiempo, $id]);

        $pdo->commit();

        echo json_encode(["success" => true]);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

    exit;
}

/* ============================================================
   PREPARANDO → LISTO
============================================================ */
if ($accion === "listOrder") {

    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data["id_factura"] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "ID no recibido"]);
        exit;
    }

    try {

        $pdo->prepare("UPDATE factura SET estado = 'Lista' WHERE id = ?")
            ->execute([$id]);

        echo json_encode(["success" => true]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

    exit;
}

/* ============================================================
   LISTO → ENTREGADO
============================================================ */
if ($accion === "sentOrder") {

    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data["id_factura"] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "ID no recibido"]);
        exit;
    }

    try {

        $pdo->beginTransaction();

        $pdo->prepare("UPDATE factura SET estado = 'Entregado' WHERE id = ?")
            ->execute([$id]);

        $pdo->prepare("UPDATE pedido SET hora_fin = NOW() WHERE id_factura = ?")
            ->execute([$id]);

        $pdo->commit();

        echo json_encode(["success" => true]);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

    exit;
}

/* ============================================================
   CANCELAR
============================================================ */
if ($accion === "cancelOrder") {

    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data["id_factura"] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "ID no recibido"]);
        exit;
    }

    try {

        $pdo->prepare("UPDATE factura SET estado = 'Cancelado' WHERE id = ?")
            ->execute([$id]);

        echo json_encode(["success" => true]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

    exit;
}

echo json_encode(["success" => false, "message" => "Acción no válida"]);
