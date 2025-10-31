<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
$pdo = require "../../../db.php";

function getOrders($pdo){
    
}

$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'getOrders':
        getOrders($pdo);
        break;

    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}

