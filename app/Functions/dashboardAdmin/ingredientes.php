<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
$pdo = require "../../../db.php";

function addIngredient($pdo) {
    $name = $_POST['nameIngredient'] ?? '';
    $description = $_POST['descriptionIngredient'] ?? '';
    $categories = $_POST['categoriesIngredient'] ?? '';
    $expirationDate = $_POST['expirationDateIngredient'] ?? null;
    $unity= $_POST['unityIngredient'] ?? '';
    $supplier = $_POST['supplierIngredient'] ?? ''; 
    $stock = $_POST['stockIngredient'] ?? ''; 
    $intStock = (int)$stock;
    $minStock = $_POST['minStockIngredient'] ?? '';
    $intMinStock = (int)$minStock;

    // Validaciones
    if ($expirationDate === '') {
        $expirationDate = null;}

    if (empty($name) || 
        empty($categories) || 
        empty($unity) || 
        empty($supplier) || 
        $intStock === null || 
        $intMinStock === null
        ) {
        echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios."]);
        exit;
        }
    
    try{
        $stmt = $pdo->prepare("SELECT * from ingrediente where nombre = ? ");
        $stmt->execute([$name]);
        $valor = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($valor){
            echo json_encode(["success" => false, "message" => "El ingrediente ya está registrado."]);
            exit;
        }
    
    }catch(PDOException $e){
        echo "$e";
    }
        
    // Guardar en la base de datos
    try {
        $stmt = $pdo->prepare("INSERT INTO ingrediente (nombre, descripcion, tipo, fecha_vencimiento, unidad, proveedor, stock_actual, stock_minimo) 
                                VALUES (?, ?, ?, ?, ?,?, ?, ?)");
        $stmt->execute([$name, $description, $categories, $expirationDate, $unity,$supplier,$intStock,$intMinStock  ]);
    
        echo json_encode(["success" => true, "message" => "Nuevo ingrediente agregado correctamente: "]);
        exit;
    
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al registrar el ingrediente: " . $e->getMessage()]);
    }
        exit;
    }

function showIngredients($pdo) {
    try {
        $input = json_decode(file_get_contents("php://input"), true);
        $search = isset($input['search']) ? trim($input['search']) : "";

        $query = "SELECT * FROM ingrediente WHERE 1=1";
        $params = [];

        if ($search !== "") {
            $query .= " AND (nombre LIKE :search OR proveedor LIKE :search)";
            $params['search'] = "%$search%";
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        $ingredientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($ingredientes) === 0) {
            echo json_encode([
                "success" => false,
                "message" => "No se encontraron ingredientes.",
            ]);
            exit;
        }
        // Calcular estado de los ingredientes
        foreach ($ingredientes as &$ingrediente) {
            if ($ingrediente['stock_actual'] <= 0) {
                $ingrediente['estado_stock'] = 'agotado';
            } elseif ($ingrediente['stock_actual'] <= $ingrediente['stock_minimo']) {
                $ingrediente['estado_stock'] = 'bajo';
            } else {
                $ingrediente['estado_stock'] = 'normal';
            }
        }

        echo json_encode([
            "success" => true,
            "message" => "Información obtenida correctamente.",
            "data" => [
                "ingredientes" => $ingredientes
            ],
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al obtener ingredientes: " . $e->getMessage()]);
    }
    exit;
}
function ingredientsAmount($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) AS totalIngredientes FROM ingrediente");
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "message" => "Cantidad de ingredientes obtenida correctamente.",
            "totalIngredientes" => $resultado['totalIngredientes'] ,
        ]);
        exit;
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al obtener la cantidad de ingredientes: " . $e->getMessage()]);
        exit;
    }
}



// RUTEO
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'addIngredient':
        addIngredient($pdo);
        break;
    case 'showIngredients':
        showIngredients($pdo);
        break;
    case 'ingredientsAmount':
        IngredientsAmount($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}