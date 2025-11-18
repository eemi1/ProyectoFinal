<?php
session_start();
header("Content-Type: application/json");
$pdo = require "../../../db.php";

if (!isset($_SESSION['usuario']) || !isset($_SESSION['id_rol'])) {
    echo json_encode(["success" => false, "message" => "Sesión no iniciada o inválida"]);
    exit;
}

try {

    $sql = "
        SELECT 
            p.id,
            p.nombre,
            p.precio,
            c.nombre AS categoria
        FROM producto p
        INNER JOIN categoria_productos c ON p.id_categoria = c.id
        ORDER BY p.id ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$productos) {
        echo json_encode([
            "success" => false,
            "message" => "No se encontraron productos."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "data" => $productos
    ]);
    exit;

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener productos: " . $e->getMessage()
    ]);
    exit;
}
