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
            
            // Normalizar promoción
            if ($producto['promocion'] === 'sinDescuento') {
            $producto['promocion'] = 'Sin Descuento';
            $producto['tipoPromocion'] = 'none';
            $producto['valorPromocion'] = 0;
            //strpos: Sirve para buscar una caracter en una palabra
            } elseif (strpos($producto['promocion'], '%') !== false) {
            $producto['promocion'] = $producto['promocion']; // ejemplo: "10%"
            $producto['tipoPromocion'] = 'porcentaje';
            $producto['valorPromocion'] = floatval($producto['promocion']) / 100; // 0.1 para 10%
            } elseif (strtolower($producto['promocion']) === '2x1') {
            $producto['promocion'] = '2x1';
            $producto['tipoPromocion'] = '2x1';
            $producto['valorPromocion'] = 0;
            } else {
            $producto['promocion'] = 'Sin Descuento';
            $producto['tipoPromocion'] = 'none';
            $producto['valorPromocion'] = 0;
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

function addCartTmp() {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;
    $precio = $data['precio'] ?? null;
    $promocion = $data['promocion'] ?? null;
    $valorPromocion = $data['valorPromocion'] ?? null;
    $tipoPromocion = $data['tipoPromocion'] ?? null;

    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode([
            "success" => false,
            "message" => "Debes iniciar sesión para agregar productos al carrito."
        ]);
        return;
    }

    if (!$id) {
        echo json_encode(["success" => false, "message" => "No se recibió id"]);
        return;
    }

    if (!isset($precio)) {
        echo json_encode(["success" => false, "message" => "No se recibió el precio del producto"]);
        return;
    }

    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    if (isset($_SESSION['cart'][$id]) && is_array($_SESSION['cart'][$id])) {
        // Si el producto ya existe, sumamos cantidad
        $_SESSION['cart'][$id]['cantidad']++;
        $_SESSION['cart'][$id]['precio'] = $precio;
        $_SESSION['cart'][$id]['promocion'] = $promocion;
        $_SESSION['cart'][$id]['valorPromocion'] = $valorPromocion;
        $_SESSION['cart'][$id]['tipoPromocion'] = $tipoPromocion;
    } else {
        // Si es nuevo producto, guardamos cantidad, precio y promocion
        $_SESSION['cart'][$id] = [
            'cantidad' => 1,
            'precio' => $precio,
            'promocion' => $promocion,
            'valorPromocion' => $valorPromocion,
            'tipoPromocion' => $tipoPromocion
        ];
    }

    echo json_encode([
        "success" => true,
        "message" => "Producto agregado",
        "cart" => $_SESSION['cart']
    ]);
}

function removeCartItem() {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if ($id && isset($_SESSION['cart'][$id])) {
        unset($_SESSION['cart'][$id]);
        echo json_encode(["success" => true, "message" => "Producto eliminado del carrito"]);
    } else {
        echo json_encode(["success" => false, "message" => "Producto no encontrado en el carrito"]);
    }
}

// RUTEO
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'showProducts':
        loadProductsIndex($pdo);
        break;
    case 'getCart':
        echo json_encode([
            "success" => true,
            "cart" => $_SESSION['cart'] ?? []
        ]);
    break;
    case 'addCartTmp':
        addCartTmp();
        break;
    case 'removeCartItem':
        removeCartItem();
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}
