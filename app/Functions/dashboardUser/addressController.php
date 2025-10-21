<?php
session_start();
header("Content-Type: application/json");

$pdo = require "../../../db.php"; // Ajusta la ruta de tu conexión PDO

// ---------------------------------
// Guardar nueva dirección
// ---------------------------------
function saveAddress($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode(["success" => false, "message" => "No hay usuario autenticado"]);
        exit;
    }

    // Obtener id del usuario
    $stmt = $pdo->prepare("SELECT id FROM usuario WHERE mail = :email");
    $stmt->execute([':email' => $_SESSION['email']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$usuario) {
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        exit;
    }
    $id_usuario = $usuario['id'];

    $data = json_decode(file_get_contents("php://input"), true);

    $alias = $data['alias'] ?? 'Casa';
    $calle = $data['calle'] ?? '';
    $numero = $data['numero'] ?? '';
    $ciudad = $data['ciudad'] ?? '';
    $departamento = $data['departamento'] ?? '';
    $codigo_postal = $data['codigoPostal'] ?? '';
    $referencia = $data['referencia'] ?? '';
    $predeterminado = !empty($data['predeterminado']) ? 1 : 0;

    // Si se marca como predeterminada, desactivar otras
    if ($predeterminado) {
        $pdo->prepare("UPDATE direccion_usuario SET activo = 0 WHERE id_usuario = ?")->execute([$id_usuario]);
    }

    $stmt = $pdo->prepare("
        INSERT INTO direccion_usuario
        (id_usuario, alias, calle, numero, ciudad, departamento, codigo_postal, referencia, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id_usuario, $alias, $calle, $numero, $ciudad, $departamento, $codigo_postal, $referencia, $predeterminado]);

    echo json_encode(["success" => true, "message" => "Dirección guardada correctamente"]);
    exit;
}

// ---------------------------------
// Obtener todas las direcciones del usuario
// ---------------------------------
function getAddresses($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode(["success" => false, "message" => "No hay usuario autenticado"]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT id, alias, calle, numero, ciudad, departamento, codigo_postal, referencia, activo
        FROM direccion_usuario
        WHERE id_usuario = (SELECT id FROM usuario WHERE mail = :email)
    ");
    $stmt->execute([':email' => $_SESSION['email']]);
    $direcciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "direcciones" => $direcciones]);
    exit;
}

// ---------------------------------
// Eliminar dirección
// ---------------------------------
function deleteAddress($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode(["success" => false, "message" => "No hay usuario autenticado"]);
        exit;
    }

    $id = $_POST['id'] ?? null;
    if (!$id) {
        echo json_encode(["success" => false, "message" => "ID no válido"]);
        exit;
    }

    $stmt = $pdo->prepare("
        DELETE FROM direccion_usuario 
        WHERE id = ? AND id_usuario = (SELECT id FROM usuario WHERE mail = ?)
    ");
    $stmt->execute([$id, $_SESSION['email']]);

    echo json_encode(["success" => true, "message" => "Dirección eliminada"]);
    exit;
}

// ---------------------------------
// Marcar dirección predeterminada
// ---------------------------------
function setPredetermined($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode(["success" => false, "message" => "No hay usuario autenticado"]);
        exit;
    }

    $id_direccion = $_POST['id'] ?? null;
    if (!$id_direccion) {
        echo json_encode(["success" => false, "message" => "ID no válido"]);
        exit;
    }

    // Obtener id del usuario
    $stmt = $pdo->prepare("SELECT id FROM usuario WHERE mail = ?");
    $stmt->execute([$_SESSION['email']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    $id_usuario = $usuario['id'];

    // Desactivar todas
    $pdo->prepare("UPDATE direccion_usuario SET activo = 0 WHERE id_usuario = ?")->execute([$id_usuario]);

    // Activar la seleccionada
    $stmt = $pdo->prepare("UPDATE direccion_usuario SET activo = 1 WHERE id = ? AND id_usuario = ?");
    $stmt->execute([$id_direccion, $id_usuario]);

    echo json_encode(["success" => true, "message" => "Dirección marcada como predeterminada"]);
    exit;
}

// ---------------------------------
// Obtener cantidad de direcciones
// ---------------------------------
function getNumberOfAddress($pdo){
        if (!isset($_SESSION['email'])) {
        echo json_encode(["success" => false, "message" => "No hay usuario autenticado"]);
        exit;
    }


    // Obtener id del usuario
    $stmt = $pdo->prepare("SELECT id FROM usuario WHERE mail = ?");
    $stmt->execute([$_SESSION['email']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    if(!$usuario){
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        exit;
    }
    $id_usuario = $usuario['id'];

    $stmt = $pdo->prepare("SELECT COUNT(*) AS cantidad FROM direccion_usuario WHERE id_usuario = ?");
    $stmt->execute([$id_usuario]);
    $cantidad = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "cantidad" => $cantidad]);
    exit;



}
// ---------------------------------
// Router
// ---------------------------------
$action = $_GET['action'] ?? '';
switch($action) {
    case 'save':
        saveAddress($pdo);
        break;
    case 'get':
        getAddresses($pdo);
        break;
    case 'delete':
        deleteAddress($pdo);
        break;
    case 'setPredetermined':
        setPredetermined($pdo);
        break;
    case 'getCount':
        getNumberOfAddress($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}
