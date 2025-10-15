<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require "../../../db.php";

$data = json_decode(file_get_contents("php://input"), true);

$fecha = $data['date'] ?? null;
$hora = $data['time'] ?? null;
$personas = $data['numberPeople'] ?? null;

if (!$fecha || !$hora || !$personas) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos recibidos.', 'debug' => $data]);
    exit;
}

$fechaHoraInicio = date('Y-m-d H:i:s', strtotime("$fecha $hora"));
$fechaHoraFin = date('Y-m-d H:i:s', strtotime("$fecha $hora +2 hours"));

try {
    $stmt = $pdo->prepare("
        SELECT m.id, m.numero, m.capacidad
        FROM mesa m
        WHERE m.capacidad >= :personas
        AND m.id NOT IN (
            SELECT r.id_mesa
            FROM reservas r
            WHERE r.fechaReserva BETWEEN :fechaHoraInicio AND :fechaHoraFin
        )
        AND m.estado = 'disponible'
    ");
    
    $stmt->execute([
        'personas' => $personas,
        'fechaHoraInicio' => $fechaHoraInicio,
        'fechaHoraFin' => $fechaHoraFin
    ]);
    $mesas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'mesas' => $mesas, 'query_fecha' => $fecha, 'query_personas' => $personas]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error BD', 'error' => $e->getMessage()]);
}
