<?php
session_start();
$pdo = require "../../../db.php";


// Datos del usuario y formulario
$id_usuario = $_SESSION['id_usuario'] ?? null;
$fecha = $_POST['date'] ?? null;
$hora = $_POST['time'] ?? null;
$cantidadPersonas = intval($_POST['numberPeople'] ?? 0);
$id_mesa = intval($_POST['mesa'] ?? 0);
$nombreCliente = $_POST['name'] ?? '';
$telefonoCliente = $_POST['phone'] ?? '';
$emailCliente = $_POST['email'] ?? '';
$notas = $_POST['notes'] ?? null;

// Validaciones básicas
if (!$id_usuario) {
    echo json_encode(['success' => false, 'message' => 'Usuario no proporcionado']);
    exit;
}
if (!$fecha || !$hora || !$cantidadPersonas || !$id_mesa || !$nombreCliente || !$telefonoCliente || !$emailCliente) {
    echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios.']);
    exit;
}

// Fecha y hora de reserva
$fechaInicio = date('Y-m-d H:i:s', strtotime("$fecha $hora"));
$fechaFin = date('Y-m-d H:i:s', strtotime("$fecha $hora +2 hours"));
$codigoReserva = 'RES-' . date('Ymd') . '-' . rand(1000, 9999);

// Verificar disponibilidad de la mesa
$check = $pdo->prepare("
    SELECT COUNT(*) FROM reservas
    WHERE id_mesa = ?
    AND fechaReserva BETWEEN ? AND ?
    AND estado != 'cancelada'
");
$check->execute([$id_mesa, $fechaInicio, $fechaFin]);
if ($check->fetchColumn() > 0) {
    echo json_encode(['success' => false, 'message' => 'La mesa ya está reservada para este horario.']);
    exit;
}

// Insertar reserva
try {
    $stmt = $pdo->prepare("
        INSERT INTO reservas 
        (id_usuario, id_mesa, fechaReserva, numeroPersonas, estado, codigoReserva, nombreCliente, telefonoCliente, emailCliente, notas)
        VALUES (?, ?, ?, ?, 'pendiente', ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $id_usuario,
        $id_mesa,
        $fechaInicio,
        $cantidadPersonas,
        $codigoReserva,
        $nombreCliente,
        $telefonoCliente,
        $emailCliente,
        $notas
    ]);

    // Obtener número de mesa
    $stmtMesa = $pdo->prepare("SELECT numero FROM mesa WHERE id = ?");
    $stmtMesa->execute([$id_mesa]);
    $mesaNumero = $stmtMesa->fetchColumn();

    // Devolver JSON con los datos exactos de la reserva
    echo json_encode([
        'success' => true,
        'codigo' => $codigoReserva,
        'fecha' => date('d/m/Y', strtotime($fechaInicio)),
        'hora' => date('H:i', strtotime($fechaInicio)),
        'personas' => $cantidadPersonas,
        'mesa' => $mesaNumero,
        'nombre' => $nombreCliente,
        'telefono' => $telefonoCliente,
        'email' => $emailCliente,
        'notas' => $notas
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al guardar reserva: ' . $e->getMessage()]);
}
