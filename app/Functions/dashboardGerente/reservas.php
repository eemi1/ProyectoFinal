<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
$pdo = require "../../../db.php";


function getUserId($pdo) {
    if (!isset($_SESSION['email'])) return null;

    $stmt = $pdo->prepare("SELECT id FROM usuario WHERE mail = ?");
    $stmt->execute([$_SESSION['email']]);
    return $stmt->fetchColumn();
}

function getReservations($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    try {
        $estado = $_GET['estado'] ?? 'todas';

        $sql = "SELECT * FROM reservas";

        if ($estado === 'todas') {
            $sql .= " WHERE DATE(fechaReserva) = CURDATE()";
        } else {
            $sql .= " WHERE estado = :estado AND DATE(fechaReserva) = CURDATE()";
        }

        $sql .= " ORDER BY 
                    CASE 
                        WHEN estado = 'Pendiente' THEN 1
                        WHEN estado = 'Confirmado' THEN 2
                        WHEN estado = 'Finalizado' THEN 3
                        WHEN estado = 'Cancelado' THEN 4
                        ELSE 5
                    END,
                    fechaReserva DESC";

        $stmt = $pdo->prepare($sql);

        if ($estado !== 'todas') {
            $stmt->bindParam(':estado', $estado);
        }

        $stmt->execute();
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($reservas as &$reserva) {
            if (!empty($reserva['fechaReserva'])) {
                $fecha = new DateTime($reserva['fechaReserva']);
                $reserva['fechaFormateada'] = $fecha->format('d \d\e F \d\e Y');
            } else {
                $reserva['fechaFormateada'] = null;
            }
        }

        // ========== CONTADORES SOLO DEL DÍA ==========

        $stmt2 = $pdo->prepare("SELECT COUNT(id) FROM reservas WHERE DATE(fechaReserva) = CURDATE()");
        $stmt2->execute();
        $totalReservas = $stmt2->fetchColumn();

        $stmt3 = $pdo->prepare("SELECT COUNT(id) FROM reservas WHERE estado = 'Pendiente' AND DATE(fechaReserva) = CURDATE()");
        $stmt3->execute();
        $totalPendientes = $stmt3->fetchColumn();

        $stmt4 = $pdo->prepare("SELECT COUNT(id) FROM reservas WHERE estado = 'Confirmado' AND DATE(fechaReserva) = CURDATE()");
        $stmt4->execute();
        $totalConfirmados = $stmt4->fetchColumn();

        $stmt5 = $pdo->prepare("SELECT COUNT(id) FROM reservas WHERE estado = 'Cancelado' AND DATE(fechaReserva) = CURDATE()");
        $stmt5->execute();
        $totalCancelados = $stmt5->fetchColumn();

        $stmt6 = $pdo->prepare("SELECT COUNT(id) FROM reservas WHERE estado = 'Finalizado' AND DATE(fechaReserva) = CURDATE()");
        $stmt6->execute();
        $totalFinalizados = $stmt6->fetchColumn();

        echo json_encode([
            "success" => true,
            "reservas" => $reservas,
            "total" => $totalReservas,
            "pendingReservations" => $totalPendientes,
            "confirmedReservations" => $totalConfirmados,
            "canceledReservations" => $totalCancelados,
            "finalizedReservations" => $totalFinalizados
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener las reservas: " . $e->getMessage()
        ]);
    }
}

function confirmReservation($pdo) {
    $userId = getUserId($pdo);
    if (!$userId) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID de reserva no recibido']);
        return;
    }

    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    // 1️⃣ Obtener el ID de la mesa asociada
    $stmt = $pdo->prepare("SELECT id_mesa FROM reservas WHERE id = ?");
    $stmt->execute([$id]);
    $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$reserva) {
        echo json_encode(['success' => false, 'message' => 'Reserva no encontrada']);
        return;
    }

    $idMesa = $reserva['id_mesa'];

    try {
        $pdo->beginTransaction();

        // 2️⃣ Actualizar estado de la reserva
        $stmt = $pdo->prepare("UPDATE reservas SET estado = 'Confirmado', confirmado_por = ? WHERE id = ?");
        $stmt->execute([$userId, $id]);

        // 3️⃣ Actualizar estado de la mesa
        $stmt = $pdo->prepare("UPDATE mesa SET estado = 'reservada' WHERE id = ?");
        $stmt->execute([$idMesa]);

        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Reserva confirmada y mesa actualizada']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

function cancelReservation($pdo) {
    $userId = getUserId($pdo);
    if (!$userId) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false]);
        return;
    }

    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id_mesa FROM reservas WHERE id = ?");
    $stmt->execute([$id]);
    $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE reservas SET estado = 'Cancelado', cancelado_por = ? WHERE id = ?")->execute([$userId, $id]);
        $pdo->prepare("UPDATE mesa SET estado = 'disponible' WHERE id = ?")->execute([$reserva['id_mesa']]);
        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function assistReservation($pdo) {
    $userId = getUserId($pdo);
    if (!$userId) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false]);
        return;
    }

    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    try {
        // 🔹 Actualizar el estado de la reserva a "En curso" (cliente asistió)
        $stmtReserva = $pdo->prepare("UPDATE reservas SET estado = 'En curso' WHERE id = ?");
        $stmtReserva->execute([$id]);

        // 🔹 Actualizar la mesa asociada a la reserva -> "ocupada"
        $stmtMesa = $pdo->prepare("UPDATE mesa SET estado = 'ocupada' WHERE id = (SELECT id_mesa FROM reservas WHERE id = ?)");
        $stmtMesa->execute([$id]);

        // 🔹 Respuesta exitosa
        echo json_encode([
            "success" => true,
            "message" => "Reserva marcada como asistida. Mesa ocupada."
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al marcar asistencia: " . $e->getMessage()
        ]);
    }
}


function finalizeReservation($pdo) {
    $userId = getUserId($pdo);
    if (!$userId) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false]);
        return;
    }

    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id_mesa FROM reservas WHERE id = ?");
    $stmt->execute([$id]);
    $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE reservas SET estado = 'Finalizado' WHERE id = ?")->execute([$id]);
        $pdo->prepare("UPDATE mesa SET estado = 'disponible' WHERE id = ?")->execute([$reserva['id_mesa']]);
        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function showTablesAvailables($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM mesa");
        $stmt->execute();
        $mesas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        

        echo json_encode([
            "success" => true,
            "mesas" => $mesas
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener las mesas disponibles: " . $e->getMessage()
        ]);
    }
}

function getTableStats($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                COUNT(*) AS total,
                SUM(estado IN ('ocupada','reservada')) AS ocupadas
            FROM mesa
        ");

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $totalMesas = (int)$result['total'];
        $mesasOcupadas = (int)$result['ocupadas'];
        $porcentaje = $totalMesas > 0 
            ? ($mesasOcupadas / $totalMesas) * 100 
            : 0;

        $porcentajeFinal = round($porcentaje, 1);

        echo json_encode([
            "success" => true,
            "totalMesas" => $totalMesas,
            "mesasOcupadas" => $mesasOcupadas,
            "porcentajeOcupacion" => $porcentajeFinal
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener estadísticas: " . $e->getMessage()
        ]);
    }
}


$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'getReservations':
        getReservations($pdo);
        break;

    case 'confirmReservation':
        confirmReservation($pdo);
        break;

    case 'cancelReservation':
        cancelReservation($pdo);
        break;
    
    case 'assistReservation':
        assistReservation($pdo);
        break;

    case 'finalizeReservation':
        finalizeReservation($pdo);
        break;

    case 'showTablesAvailables':
        showTablesAvailables($pdo);
        break;

    case 'getTableStats':
        getTableStats($pdo);
        break;

    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}

