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
        // 1️⃣ Obtener ID del usuario
        $stmt = $pdo->prepare("SELECT id FROM usuario WHERE mail = :email");
        $stmt->execute([':email' => $_SESSION['email']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
            exit;
        }

        $id_usuario = $usuario['id'];

        // 2️⃣ Traer todas las facturas con su dirección
        $stmt = $pdo->prepare("
            SELECT f.id, f.fecha, f.total, f.estado, f.codigo, f.metodoPago, f.metodoEntrega,
                   d.id AS id_direccion, d.calle, d.numero, d.ciudad, d.departamento, d.codigo_postal, d.referencia
            FROM factura f
            LEFT JOIN direccion_usuario d ON f.id_direccion = d.id
            WHERE f.id_cliente = :id_cliente
            ORDER BY f.fecha DESC
        ");
        $stmt->execute([':id_cliente' => $id_usuario]);
        $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $pedidos = [];

        // 3️⃣ Para cada factura, traer los productos
        foreach ($facturas as $factura) {
            $stmt = $pdo->prepare("
                SELECT df.id_factura, df.id_producto, df.cantidad, df.precio_unitario,
                    p.nombre
                FROM detalle_factura df
                JOIN producto p ON df.id_producto = p.id
                WHERE df.id_factura = :id_factura
            ");
            $stmt->execute([':id_factura' => $factura['id']]);
            $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($productos as &$prod) {
                $prod['subtotal'] = $prod['cantidad'] * $prod['precio_unitario'];
            }

            $fecha = new DateTime($factura['fecha']);
            $fechaFormateada = $fecha->format('d \d\e F \d\e Y');

            // Guardar factura como pedido
            $pedidos[] = [
                "id_pedido" => $factura['id'],
                "fecha" => $factura['fecha'],
                "total" => $factura['total'],
                "estado" => $factura['estado'],
                "codigo" => $factura['codigo'],
                "metodoPago" => $factura['metodoPago'],
                "metodoEntrega" => $factura['metodoEntrega'],
                "direccion" => [
                    "id_direccion" => $factura['id_direccion'],
                    "calle" => $factura['calle'],
                    "numero" => $factura['numero'],
                    "ciudad" => $factura['ciudad'],
                    "departamento" => $factura['departamento'],
                    "codigo_postal" => $factura['codigo_postal'],
                    "referencia" => $factura['referencia']
                ],
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
};

function getReservations($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    try {
        // Obtener ID del usuario logueado
        $stmt = $pdo->prepare("SELECT id FROM usuario WHERE mail = :email");
        $stmt->execute([':email' => $_SESSION['email']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
            exit;
        }

        $id_usuario = $usuario['id'];

        // Obtener reservas del usuario
        $stmt = $pdo->prepare("
            SELECT * 
            FROM reservas 
            WHERE id_usuario = :id_usuario
            ORDER BY fechaReserva DESC
        ");
        $stmt->execute([':id_usuario' => $id_usuario]);
        $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$reservas) {
            echo json_encode([
                "success" => false,
                "reservas" => [],
                "message" => "No se encontraron reservas."
            ]);
            exit;
        }

        foreach ($reservas as &$reserva) {
            if (!empty($reserva['fechaReserva'])) {
                $fecha = new DateTime($reserva['fechaReserva']);
                $reserva['fechaFormateada'] = $fecha->format('d \d\e F \d\e Y');
            } else {
                $reserva['fechaFormateada'] = null;
            }
        }

        echo json_encode([
            "success" => true,
            "reservas" => $reservas
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener las reservas: " . $e->getMessage()
        ]);
        exit;
    }
}

function cancelReservation($pdo) {
    if (!isset($_SESSION['email'])) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario no autenticado"
        ]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $codigoReserva = $data['codigoReserva'] ?? null;

    if (!$codigoReserva) {
        echo json_encode([
            "success" => false,
            "message" => "Código de reserva no válido"
        ]);
        exit;
    }

    try {
        // Obtener ID del usuario logueado
        $stmt = $pdo->prepare("SELECT id FROM usuario WHERE mail = :email");
        $stmt->execute([':email' => $_SESSION['email']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
            exit;
        }

        $id_usuario = $usuario['id'];

        // Cancelar la reserva
        $stmt = $pdo->prepare("
            UPDATE reservas
            SET estado = 'Cancelado'
            WHERE codigoReserva = :codigoReserva AND id_usuario = :id_usuario
        ");
        $stmt->execute([':codigoReserva' => $codigoReserva, ':id_usuario' => $id_usuario]);

        echo json_encode([
            "success" => true,
            "message" => "Reserva cancelada exitosamente"
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error al cancelar la reserva: " . $e->getMessage()
        ]);
        exit;
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
    case 'getOrders':
        getOrders($pdo);
        break;
    case 'getReservations':
        getReservations($pdo);
        break;
    case 'cancelReservation':
        cancelReservation($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}
