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
    $cantidadesIngredientes = $_POST['cantidadIngrediente'] ?? []; // array asociativo id => cantidad

    // Validar campos obligatorios
    if (empty($productName) || empty($productPrice) || empty($intCategoriesProduct)) {
        echo json_encode(["success" => false, "message" => "Todos los campos obligatorios deben completarse."]);
        exit;
    }

    if (!is_numeric($productPrice) || $productPrice <= 0 || $productPromotion < 0) {
        echo json_encode(["success" => false, "message" => "El valor debe ser un número positivo."]);
        exit;
    }

    if ($productPromotion != 'sinDescuento' && $productPromotion != '2x1') {
        $productPromotion = $productPromotion . "%";
    }

    try {
        if ($productFeatured) {
            $stmtCount = $pdo->query("SELECT COUNT(*) FROM producto WHERE destacado = 1");
            $countFeatured = $stmtCount->fetchColumn();

            if ($countFeatured >= 4) {
                echo json_encode([
                    "success" => false, 
                    "message" => "No se pueden tener más de 4 productos destacados."
                ]);
                exit;
            }
        }

        // Insertar producto
        $stmt = $pdo->prepare("INSERT INTO producto (id_categoria, nombre, precio, descripcion, tiempoPreparacion, calorias, promocion, destacado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $intCategoriesProduct,
            $productName,
            $productPrice,
            $productDescription,
            $productPreparationTime,
            $productCalories,
            $productPromotion,
            $productFeatured
        ]);

        $productId = $pdo->lastInsertId();

        //Subir Imagen
        if (!empty($_FILES['productImage']['name'])){

            $dirImage = "../../../uploads/";
            if(!is_dir($dirImage)) {mkdir($dirImage, 0755, true);} 

            $file = $_FILES['productImage'];
            $fileExtension = pathinfo($_FILES['productImage']['name'], PATHINFO_EXTENSION);
            $fileName = $productId . "." . "jpg";

            $allowed_extensions = ["jpg", "jpeg", "png"];
            if (!in_array($fileExtension, $allowed_extensions)) {
                echo json_encode(["success" => false, "message" => "No se admite este formato de imagen."]);
                exit;
            }

            move_uploaded_file($file['tmp_name'], $dirImage.$fileName);

        }

        // Insertar ingredientes
        $stmtIng = $pdo->prepare("INSERT INTO producto_ingrediente (id_producto, id_ingrediente, cantidad) VALUES (?, ?, ?)");
        foreach ($productIngredients as $ingredientId) {
            $cantidad = isset($cantidadesIngredientes[$ingredientId]) ? $cantidadesIngredientes[$ingredientId] : 0;
            $stmtIng->execute([$productId, $ingredientId, $cantidad]);
        }

        echo json_encode(["success" => true, "message" => "Producto registrado correctamente."]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al registrar el producto: " . $e->getMessage()]);
        exit;
    }
}

function deleteProduct($pdo){
    $input = json_decode(file_get_contents("php://input"), true);
    $productId = $input['productId'] ?? null;

    if ($productId === null || !is_numeric($productId)) {
        echo json_encode(["success" => false, "message" => "ID de producto inválido."]);
        exit;
    }

    try {
        // Verificar si el producto existe
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM producto WHERE id = ?");
        $stmtCheck->execute([$productId]);
        if ($stmtCheck->fetchColumn() == 0) {
            echo json_encode(["success" => false, "message" => "El producto no existe."]);
            exit;
        }

        // Eliminar relaciones en producto_ingrediente
        $stmtDelIng = $pdo->prepare("DELETE FROM producto_ingrediente WHERE id_producto = ?");
        $stmtDelIng->execute([$productId]);

        // Eliminar el producto
        $stmtDelProd = $pdo->prepare("DELETE FROM producto WHERE id = ?");
        $stmtDelProd->execute([$productId]);

        echo json_encode(["success" => true, "message" => "Producto eliminado correctamente."]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al eliminar el producto: " . $e->getMessage()]);
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

        foreach ($productos as &$producto) {

            if ($producto['destacado'] == 1) {
                $producto['booleanDestacado'] = true;
            } else {
                $producto['booleanDestacado'] = false;
            }

            $stmtIng = $pdo->prepare("
                SELECT ingrediente.nombre, producto_ingrediente.cantidad
                FROM producto_ingrediente 
                JOIN ingrediente ON producto_ingrediente.id_ingrediente = ingrediente.id
                WHERE producto_ingrediente.id_producto = :id_producto
            ");
            $stmtIng->execute(['id_producto' => $producto['id']]);
            $ingredientes = $stmtIng->fetchAll(PDO::FETCH_ASSOC);
            $producto['ingredientes'] = $ingredientes; // array de nombre y cantidad

            if ($producto['promocion'] === 'sinDescuento') {
            $producto['promocion'] = 'Sin Descuento';
        }
        };
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

function countProducts($pdo){
    
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) AS totalProductos FROM producto");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "totalProductos" => $result['totalProductos']]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al contar productos: " . $e->getMessage()]);
    }
}

function countFeatured($pdo){
    try {
        $stmt2 = $pdo->prepare("SELECT COUNT(*) AS totalFavoritos FROM producto WHERE destacado = 1");
        $stmt2->execute();
        $result2 = $stmt2->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "totalFavoritos" => $result2['totalFavoritos']]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al contar productos destacados: " . $e->getMessage()]);
    }
}

function showProductsModal($pdo){
    try {
        $input = json_decode(file_get_contents("php://input"), true);
        $productId = $input['productId'] ?? null;

        $stmt = $pdo->prepare("SELECT * FROM producto WHERE id = :id");
        $stmt->execute(['id' => $productId]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt2 = $pdo->prepare("
            SELECT ingrediente.nombre, producto_ingrediente.cantidad
            FROM producto_ingrediente 
            JOIN ingrediente ON producto_ingrediente.id_ingrediente = ingrediente.id
            WHERE producto_ingrediente.id_producto = :id_producto
            ");
        $stmt2->execute(['id_producto' => $productId]);
        $ingredientes = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        if ($producto['destacado'] == 0) {
            $producto['valorPromocion'] = "Sin Descuento";
        }else{
            $producto['valorPromocion'] = $producto['promocion'];
        }


        if (count($producto) === 0) {
            echo json_encode([
                "success" => false,
                "message" => "No se encontraron productos.",
            ]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "Información obtenida correctamente.",
            "data" => $producto,
            "ingredientes" => $ingredientes
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al obtener productos: " . $e->getMessage()]);
    }
}
    // RUTEO
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'addProduct':
        addProduct($pdo);
        break;
    case 'deleteProduct':
        deleteProduct($pdo);
        break;
    case 'showProducts':
        showProducts($pdo);
        break;
    case 'countProducts':
        countProducts($pdo);
        break;
    case 'countFeatured':
        countFeatured($pdo);
        break;
    case 'showProductsModal':
        showProductsModal($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}