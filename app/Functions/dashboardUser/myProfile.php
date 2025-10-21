<?php
session_start();
header("Content-Type: application/json");

$pdo = require "../../../db.php";

function saveController($pdo) {
if(!isset($_SESSION['usuario'])){
    echo json_encode([
        "success" => false,
        "message" => "No hay usuario autenticado"
    ]);
    exit;
}


$name = $_POST['nombreCompleto'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$fechaNacimiento = $_POST['fechaNacimiento'] ?? '';
$email = $_SESSION['email'] ?? '';

try {
    $stmt = $pdo->prepare("UPDATE usuario SET nombreCompleto = :nombreCompleto, telefono = :telefono, fechaNacimiento = :fechaNacimiento WHERE mail = :email");
    $stmt->execute([
        ':email' => $email,
        ':telefono' => $telefono,
        ':fechaNacimiento' => $fechaNacimiento,
        ':nombreCompleto' => $name
    ]);

    $stmt = $pdo->prepare("SELECT * FROM usuario WHERE mail = :email");
    $stmt->execute([':email' => $email]);
    $resultados = $stmt->fetch(PDO::FETCH_ASSOC);

    $_SESSION["usuario"] = $resultados["nombreCompleto"];
    $_SESSION["tel"] = $resultados["telefono"];
    $_SESSION["fechaNacimiento"] = $resultados["fechaNacimiento"];

    echo json_encode([
        "success" => true,
        "message" => "Perfil actualizado correctamente",
        "usuarios" => $resultados
    ]);
    exit;
} catch(PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al actualizar: " . $e->getMessage()
    ]);
    exit;
}
}

function fechaMiembro($pdo) {
    try{
        $email = $_SESSION['email'] ?? '';

        $pdo->exec("SET lc_time_names = 'es_ES'");
        $stmt = $pdo -> prepare("SELECT fechaRegistro, DATE_FORMAT(fechaRegistro, '%d de %M %Y') AS fechaFormateada FROM usuario WHERE mail = :email ");
        $stmt -> execute([':email' => $email]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "message" => "Fecha de registro obtenida correctamente.",
            "fechaFormateada" => $res["fechaFormateada"]
        ]);
        exit;

    }catch(PDOException $e){
        // Manejar error sin imprimir JSON ni hacer exit
        return null;
    }
}

function getOrders($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

try {
    // 1. Obtener ID del usuario
    $stmt = $pdo->prepare("SELECT id FROM usuario WHERE mail = :email");
    $stmt->execute([':email' => $_SESSION['email']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        exit;
    }

    $id_usuario = $usuario['id'];

    // 2. Traer todas las facturas del usuario
    $stmt = $pdo->prepare("SELECT id, fecha, total, estado, codigo FROM factura WHERE id_cliente = :id_cliente ORDER BY fecha DESC");
    $stmt->execute([':id_cliente' => $id_usuario]);
    $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $pedidos = [];

    // 3. Para cada factura, traer los productos
    foreach ($facturas as $factura) {
        $stmt = $pdo->prepare("
            SELECT id_factura, id_producto, cantidad, precio_unitario
            FROM detalle_factura
            WHERE id_factura = :id_factura
        ");
        $stmt->execute([':id_factura' => $factura['id']]);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calcular subtotal de cada producto
        foreach ($productos as &$prod) {
            $prod['subtotal'] = $prod['cantidad'] * $prod['precio_unitario'];

        }

        $fecha = new DateTime($factura['fecha']);
            
        $fmt = new IntlDateFormatter(
            'es_ES', // idioma español
            IntlDateFormatter::LONG, // formato de fecha largo ("20 de octubre de 2025")
            IntlDateFormatter::NONE  // sin hora
        );
        $fechaFormateada = $fmt->format($fecha);

        // Guardar factura como pedido
        $pedidos[] = [
            "id_pedido" => $factura['id'],
            "fecha" => $factura['fecha'],
            "total" => $factura['total'],
            "estado" => $factura['estado'],
            "codigo" => $factura['codigo'],
            "fechaFormateada" => $fechaFormateada,
            "productos" => $productos
        ];


    }

    echo json_encode([
        "success" => !empty($pedidos),
        "pedidos" => $pedidos
    ]);
    exit;

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener pedidos: " . $e->getMessage()
    ]);
    exit;
}

}
function saveAddress($pdo){
    
}


// RUTEO
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'saveController':
        saveController($pdo);
        break;
    case 'fechaMiembro':
        fechaMiembro($pdo);
        break;
    case 'getOrders':
        getOrders($pdo);
    case 'saveAddress':
        saveAddress($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}
