<?php
require_once '../../../bd.php';

if (!isset($_GET['action'])) {
    echo json_encode(['success' => false, 'message' => 'No se especificó una acción']);
    exit;
}

$action = $_GET['action'];

switch ($action) {
    case 'confirmReservation':
        confirmReservation($pdo);
        break;

    case 'cancelReservation':
        cancelReservation($pdo);
        break;

    case 'finalizeReservation':
        finalizeReservation($pdo);
        break;

    case 'getReservations':
        getReservations($pdo);
        break;
    
    case 'didNotAttend':
        didNotAttend($pdo);
        break;
}

function confirmReservation($pdo) {
    $id = $_POST['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID de reserva no recibido']);
        return;
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
        $stmt = $pdo->prepare("UPDATE reservas SET estado = 'Confirmado' WHERE id = ?");
        $stmt->execute([$id]);

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
    $id = $_POST['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false]);
        return;
    }

    $stmt = $pdo->prepare("SELECT id_mesa FROM reservas WHERE id = ?");
    $stmt->execute([$id]);
    $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE reservas SET estado = 'Cancelado' WHERE id = ?")->execute([$id]);
        $pdo->prepare("UPDATE mesa SET estado = 'disponible' WHERE id = ?")->execute([$reserva['id_mesa']]);
        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function finalizeReservation($pdo) {
    $id = $_POST['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false]);
        return;
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

function didNotAttend($pdo){
    $id = $_POST['id'] ?? null;
    if (!$id) {
        echo json_encode(['success' => false]);
        return;
    }

    $stmt = $pdo->prepare("SELECT id_mesa FROM reservas WHERE id = ?");
    $stmt->execute([$id]);
    $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE reservas SET estado = 'No asistió' WHERE id = ?")->execute([$id]);
        $pdo->prepare("UPDATE mesa SET estado = 'disponible' WHERE id = ?")->execute([$reserva['id_mesa']]);
        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>