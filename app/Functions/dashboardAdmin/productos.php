<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
$pdo = require "../../../db.php";

function addProduct($pdo) {
    // Recibir datos del formulario
    $productName = $_POST['productName'] ?? '';
    $productPrice = $_POST['productPrice'] ?? '';
    $categoriesProductString = $_POST['productCategories'] ?? '';
    $intCategoriesProduct = (int)$categoriesProductString;
    $productDescription = $_POST['productDescription'] ?? '';   
    $productPreparationTime = $_POST['productPreparationTime'] ?? '';
    $productCalories = $_POST['productCalories'] ?? null;
    $productPromotion = $_POST['productPromotion'] ?? 'sinDescuento';
    $productIngredients = $_POST['productIngrediente'] ?? []; // array de IDs de ingredientes
    $productFeatured = isset($_POST['productFeatured']) ? 1 : 0;

    // Validar campos obligatorios
    if (empty($productName) || empty($productPrice) || empty($intCategoriesProduct) || empty($productIngredients)) {
        echo json_encode(["success" => false, "message" => "Todos los campos obligatorios deben completarse."]);
        exit;
    }

    try {
            $stmt = $pdo->prepare("INSERT INTO producto (id_categoria, nombre, precio, descripcion, tiempoPreparacion, calorias, promocion) 
                VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $intCategoriesProduct,
                $productName,
                $productPrice,
                $productDescription,
                $productPreparationTime,
                $productCalories,
                $productPromotion
            ]);

        $productId = $pdo->lastInsertId();

        // Insertar relaciones con los ingredientes seleccionados
        $stmtIng = $pdo->prepare("INSERT INTO producto_ingrediente (id_producto, id_ingrediente) VALUES (?, ?)");
        foreach ($productIngredients as $ingredientId) {
            $stmtIng->execute([$productId, $ingredientId]);
        }

        echo json_encode(["success" => true, "message" => "Producto registrado correctamente."]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al registrar el producto: " . $e->getMessage()]);
        exit;
    }
}

function showProducts($pdo){
    try {
        $input = json_decode(file_get_contents("php://input"), true);
        $search = isset($input['search']) ? trim($input['search']) : "";

        $query = "SELECT producto.*, categoria_productos.nombre AS categoria FROM producto JOIN categoria_productos ON producto.id_categoria = categoria_productos.id";
        $params = [];

        if ($search !== "") {
            $query .= " WHERE producto.nombre LIKE :search";
            $params['search'] = "%$search%";    
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($productos) === 0) {
            echo json_encode([
                "success" => false,
                "message" => "No se encontraron productos.",
            ]);
            exit;
        }

        // Traer ingredientes de cada producto
        foreach ($productos as &$producto) {
            $stmtIng = $pdo->prepare("
                SELECT ingrediente.nombre 
                FROM producto_ingrediente 
                JOIN ingrediente ON producto_ingrediente.id_ingrediente = ingrediente.id
                WHERE producto_ingrediente.id_producto = :id_producto
            ");
            $stmtIng->execute(['id_producto' => $producto['id']]);
            $ingredientes = $stmtIng->fetchAll(PDO::FETCH_COLUMN);
            $producto['ingredientes'] = $ingredientes; // array de nombres
        }


        echo json_encode([
            "success" => true,
            "message" => "Información obtenida correctamente.",
            "data" => [
                "productos" => $productos
            ],
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al obtener ingredientes: " . $e->getMessage()]);
    }
    exit;
}
    // RUTEO
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'addProduct':
        addProduct($pdo);
        break;
    case 'showProducts':
        showProducts($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}