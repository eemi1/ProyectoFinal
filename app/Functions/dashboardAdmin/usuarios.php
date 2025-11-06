<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
$pdo = require "../../../db.php";

function mostrarUsuarios($pdo) {
    try {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $search = isset($input['search']) ? trim($input['search']) : "";
        $valueRol = isset($input['valueRol']) ? trim($input['valueRol']) : "";

        $query = "
                SELECT u.id, u.nombreCompleto, u.mail, u.id_rol, u.fechaRegistro, u.fechaNacimiento,
                COUNT(f.id) AS totalPedidos
            FROM usuario u
            LEFT JOIN factura f ON f.id_cliente = u.id
            WHERE 1=1
        
        ";
        $params = [];

        if ($search !== "") {
            $query .= " AND (nombreCompleto LIKE :search OR mail LIKE :search)";
            $params['search'] = "%$search%";
        }

        if ($valueRol !== "") {
            $query .= " AND id_rol = :valueRol";
            $params['valueRol'] = $valueRol;
        }

        if($valueRol == 0){
            $query = "SELECT * FROM usuario WHERE 1=1";
            $params = [];
        }

        $query .= " GROUP BY u.id";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);

        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($usuarios) === 0) {
            echo json_encode([
                "success" => false,
                "message" => "No se encontraron usuarios.",
            ]);
            exit;
        }

        foreach ($usuarios as &$usuario) {
            $rol_usuarios = $usuario['id_rol'];

            switch ($rol_usuarios) {
                case 1: $rol = "Cliente"; break;
                case 2: $rol = "Administrador"; break;
                case 3: $rol = "Mozo"; break;
                case 4: $rol = "Cocinero"; break;
                case 5: $rol = "Gerente"; break;
                case 6: $rol = "Delivery"; break;
                default: $rol = "ERROR";
            }
            $usuario['rol'] = $rol;
        }

        echo json_encode([
            "success" => true,
            "message" => "Información obtenida correctamente.",
            "data" => [
                "usuarios" => $usuarios
            ],
        ]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al obtener usuarios: " . $e->getMessage()]);
    }
    exit;
}
function cantidadUsuarios($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) AS totalUsuarios FROM usuario");
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "message" => "Cantidad de usuarios obtenida correctamente.",
            "totalUsuarios" => $resultado['totalUsuarios'] ,
        ]);
        exit;
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al obtener la cantidad de usuarios: " . $e->getMessage()]);
        exit;
    }
}
function addUsers($pdo) {
    $name = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $telefono = $_POST['tel'] ?? '';
    $rol_id = $_POST['role'] ?? 1; // Valor por defecto 1 (Cliente)
    $int_rol_id = (int)$rol_id;
    
    // Validaciones
    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios."]);
        exit;
    }
    
    try{
        $stmt = $pdo->prepare("SELECT * from usuario where mail = ? ");
        $stmt->execute([$email]);
        $valor = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($valor){
            echo json_encode(["success" => false, "message" => "El gmail ya esta registrado a una cuenta."]);
            exit;
        }
    
    }catch(PDOException $e){
        echo "$e";
    }
    
    // Hash de la contraseña
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Guardar en la base de datos
    try {
        $stmt = $pdo->prepare("INSERT INTO usuario (nombreCompleto, mail, contraseña, telefono, id_rol) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $password_hash, $telefono, $int_rol_id]);
    
        echo json_encode(["success" => true, "message" => "Nuevo usuario agregado correctamente: "]);
        exit;
    
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al registrar: " . $e->getMessage()]);
    }
        exit;
    }

function deleteUser($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['userId'] ?? null;

    if (!$userId) {
        echo json_encode(["success" => false, "message" => "ID de usuario no proporcionado."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM usuario WHERE id = ?");
        $stmt->execute([$userId]);

        echo json_encode(["success" => true, "message" => "Usuario eliminado correctamente."]);
        exit;

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error al eliminar usuario: " . $e->getMessage()]);
        exit;
    }
}

function editUser($pdo){
    $userId = $_POST['userId'] ?? null;
    $name = $_POST['username'] ?? '';
    $telefono = $_POST['tel'] ?? '';
    $rol_id = $_POST['role'] ?? 1;
    $int_rol_id = (int)$rol_id;

    if (!$userId) {
        echo json_encode(["success" => false, "message" => "ID de usuario no proporcionado."]);
        exit;
    }

    try{
        $stmt = $pdo->prepare("UPDATE usuario SET nombreCompleto = ?, telefono = ?, id_rol = ? WHERE id = ?");
        $stmt->execute([$name, $telefono, $int_rol_id, $userId]);
        echo json_encode(["success" => true, "message" => "Usuario editado correctamente."]);


    }catch(PDOException $e){
        echo json_encode(["success" => false, "message" => "Error al editar usuario: " . $e->getMessage()]);
        exit;
    }


}

function searchInput() {

}

// RUTEO
$accion = $_GET['action'] ?? null;

switch ($accion) {
    case 'CantidadUsuarios':
        cantidadUsuarios($pdo);
        break;
    case 'mostrarUsuarios':
        mostrarUsuarios($pdo);
        break;
    case 'addUsers':
        addUsers($pdo);
        break;
    case 'deleteUser':
        deleteUser($pdo);
        break;
    case 'editUser':
        editUser($pdo);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Acción no válida"]);
        exit;
}