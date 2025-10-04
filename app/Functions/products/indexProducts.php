<?php
session_start();
header("Content-Type: application/json");
$pdo = require "../../../db.php";

function loadProductsIndex($pdo) {
    try {
        $consultaProductos = $pdo->prepare("
            SELECT 
                producto.id AS id,
                producto.nombre AS nombre,
                producto.descripcion AS descripcion,
                producto.precio AS precio,
                producto.tiempoPreparacion AS tiempoPreparacion,
                producto.calorias AS calorias,
                producto.promocion AS promocion,
                producto.destacado AS destacado,
                categoria_productos.nombre AS categoria
            FROM producto
            JOIN categoria_productos ON producto.id_categoria = categoria_productos.id
            ORDER BY producto.id ASC
        ");
        $consultaProductos->execute();
        $productos = $consultaProductos->fetchAll(PDO::FETCH_ASSOC);

        if (empty($productos)) {
            echo json_encode([
                "success" => false,
                "message" => "No se encontraron productos."
            ]);
            exit;
        }

        foreach ($productos as &$producto) {
            $producto['destacado'] = $producto['destacado'] == 1;

            // Obtener ingredientes
            $consultaIngredientes = $pdo->prepare("
                SELECT ingrediente.nombre AS nombre, producto_ingrediente.cantidad
                FROM producto_ingrediente
                JOIN ingrediente ON producto_ingrediente.id_ingrediente = ingrediente.id
                WHERE producto_ingrediente.id_producto = :id_producto
            ");
            $consultaIngredientes->execute(['id_producto' => $producto['id']]);
            $producto['ingredientes'] = $consultaIngredientes->fetchAll(PDO::FETCH_ASSOC);

            if ($producto['promocion'] === 'sinDescuento') {
                $producto['promocion'] = 'Sin Descuento';
            }
        }

        echo json_encode([
            "success" => true,
            "message" => "Productos obtenidos correctamente.",
            "data" => [
                "productos" => $productos
            ]
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener productos: " . $e->getMessage()
        ]);
        exit;
    }
}

$accion = $_GET['action'] ?? null;
if ($accion === 'showProducts') {
    loadProductsIndex($pdo);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Acción no válida"
    ]);
    exit;
}
