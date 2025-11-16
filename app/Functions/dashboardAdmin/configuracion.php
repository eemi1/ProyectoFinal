<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
$pdo = require "../../../db.php";

function getConfigurationRestaurant($pdo) {

    try{
        $stmt = $pdo->query("SELECT c.id, c.nombre, c.capacidad_total, c.descripcion, c.telefono, c.email, c.direccion, c.ultima_actualizacion
        FROM configuracion c 
        WHERE c.id = 1
        ");
        $getConfiguration = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "configuration" => $getConfiguration
        ]);
    }catch(PDOException $e){
        echo json_encode([
            "success" => false,
            "message" => "Error al obtener la configuración:" . $e->getMessage()
        ]);
    }

}

function sentConfigurationRestaurant($pdo) {
    $rutaImagen = null;
    try{
        // Verificar si se envió un archivo
        if (!empty($_FILES['logoRestaurante']['name'])) {
            // Carpeta donde guardar la imagen
            $carpeta = $_SERVER['DOCUMENT_ROOT'] . "uploads/logo/";
            if (!is_dir($carpeta)) {
                mkdir($carpeta, 0777, true); // crear carpeta si no existe
            }

            // Nombre fijo para la imagen
            $nombreArchivo = "logo.jpg";
            $rutaImagen = $carpeta . $nombreArchivo;

            // Mover archivo subido a la carpeta destino
            move_uploaded_file($_FILES['logoRestaurante']['tmp_name'], $rutaImagen);
        } else {
            error_log("No se envió ninguna imagen");
        }
        

        // --- Datos del formulario ---
        $nombre = $_POST['nombreRestaurante'];
        $capacidad = $_POST['capacidadRestaurante'];
        $descripcion = $_POST['descripcionRestaurante'];
        $telefono = $_POST['telefonoRestaurante'];
        $email = $_POST['emailRestaurante'];
        $direccion = $_POST['direccionRestaurante'];
        $seccion = 'index';

        // --- Actualizar el registro (único id = 1) ---
        $sql = "UPDATE configuracion SET 
                    nombre=?, capacidad_total=?, descripcion=?, telefono=?, 
                    email=?, direccion=?, seccion=?, ultima_actualizacion=NOW() 
                WHERE id=1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nombre, $capacidad, $descripcion, $telefono, $email, $direccion, $seccion]);

        echo json_encode([
            "success" => true,
            "message" => "Configuración del restaurante actualizada correctamente: "
        ]);

    }catch(PDOException $e){
        echo json_encode([
            "success" => false,
            "message" => "Error al actualizar la configuración: " . $e->getMessage()
        ]);
    }
}

function loadTables($pdo){
    try{
        $stmt = $pdo->query('SELECT id, capacidad, estado, descripcion FROM mesa ORDER BY fecha_actualizacion DESC, id ASC');
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
        "success" => true,
        "data" => $data
        ]);

    }catch(PDOException $e){
        echo json_encode([
        "success" => false,
        "message" => "Error al cargar las mesas: " . $e->getMessage()
        ]);
    }
}

if (!isset($_SESSION['usuario']) || !isset($_SESSION['id_rol'])) {
    echo json_encode(["success" => false, "message" => "Sesión no iniciada o inválida"]);
    exit;
}


function updateTable($pdo){
    try{
        // Validar campos enviados
        if (
            !isset($_POST['id']) ||
            !isset($_POST['capacidad']) ||
            !isset($_POST['descripcion'])
        ) {
            echo json_encode([
                "success" => false,
                "message" => "Datos incompletos para actualizar la mesa."
            ]);
            return;
        }

        $id = intval($_POST['id']);
        $capacidad = intval($_POST['capacidad']);
        $descripcion = trim($_POST['descripcion']);

        // Query segura
        $sql = "UPDATE mesa 
                SET capacidad = ?, descripcion = ?
                WHERE id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$capacidad, $descripcion, $id]);

        echo json_encode([
            "success" => true,
            "message" => "Mesa actualizada correctamente."
        ]);

    } catch(PDOException $e){
        echo json_encode([
            "success" => false,
            "message" => "Error al actualizar la mesa: " . $e->getMessage()
        ]);
    }
}

function addTable($pdo){
    try{
        $capacidad = intval($_POST['capacidad'] ?? 4);
        $descripcion = $_POST['descripcion'] ?? "Mesa nueva";
        $estado = "libre";

        $sql = "INSERT INTO mesa (capacidad, estado, descripcion)
                VALUES (?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$capacidad, $estado, $descripcion]);

        echo json_encode([
            "success" => true,
            "message" => "Mesa creada correctamente.",
            "id" => $pdo->lastInsertId()
        ]);

    } catch(PDOException $e){
        echo json_encode([
            "success" => false,
            "message" => "Error al agregar la mesa: " . $e->getMessage()
        ]);
    }
}

function deleteTable($pdo){
    try{
        if (!isset($_POST['id'])) {
            echo json_encode([
                "success" => false,
                "message" => "No se recibió el ID de la mesa."
            ]);
            return;
        }

        $id = intval($_POST['id']);

        $stmt = $pdo->prepare("DELETE FROM mesa WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode([
            "success" => true,
            "message" => "Mesa eliminada correctamente."
        ]);

    } catch(PDOException $e){
        echo json_encode([
            "success" => false,
            "message" => "Error al eliminar la mesa: " . $e->getMessage()
        ]);
    }
}

if (!isset($_SESSION['usuario']) || !isset($_SESSION['id_rol'])) {
    echo json_encode(["success" => false, "message" => "Sesión no iniciada o inválida"]);
    exit;
}

$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'getConfigurationRestaurant':
        getConfigurationRestaurant($pdo);
        break;
    case 'sentConfigurationRestaurant':
        sentConfigurationRestaurant($pdo);
        break;
    case 'loadTables':
        loadTables($pdo);
        break;
    case 'updateTable':
        updateTable($pdo);
        break;
    case 'addTable':
        addTable($pdo);
        break;
    case 'deleteTable':
        deleteTable($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        break;
}