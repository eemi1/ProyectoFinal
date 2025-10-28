<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
$pdo = require "../../../db.php";

function getReservations($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM reservas ORDER BY fechaReserva DESC");
        $stmt->execute();
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$reservas) {
            echo json_encode([
                "success" => false,
                "reservas" => [],
                "message" => "No se encontraron reservas."
            ]);
            exit;
        }

        foreach ($reservas as &$reserva) {
            if (!empty($reserva['fechaReserva'])) {
                $fecha = new DateTime($reserva['fechaReserva']);
                $reserva['fechaFormateada'] = $fecha->format('d \d\e F \d\e Y');
            } else {
                $reserva['fechaFormateada'] = null;
            }
        }

        echo json_encode([
            "success" => true,
            "reservas" => $reservas
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener las reservas: " . $e->getMessage()
        ]);
        exit;
    }
}


$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'getReservations':
        getReservations($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}