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


// RUTEO
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'saveController':
        saveController($pdo);
        break;
        
        case 'fechaMiembro':
        fechaMiembro($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}
