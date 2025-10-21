<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
require "../../../db.php";

$email = $_POST["email"] ?? ''; // ??: sirve para asignar una cadena vacía si el campo no existe
$password = $_POST["password"] ?? '';

if (empty($email) || empty($password)){
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM usuario WHERE mail = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$usuario){
            echo json_encode([
            "success" => false,
            "message" => "El correo eléctronico no esta asociado a ninguna cuenta."
        ]);
        exit;
    }
        $password_hasheada = $usuario['contraseña'];

        if (password_verify($password,$password_hasheada )){
            $rol_usuario = $usuario['id_rol'];
            switch ($rol_usuario) {
                case 1:
                        $rol = "Rol cliente";
                    break;
                case 2:
                        $rol = "Rol administrador";
                    break;
                case 3:
                        $rol = "Rol mozo";
                    break;
                case 4:
                        $rol = "Rol cocinero";
                    break;
                case 5:
                        $rol = "Rol cajero";
                    break;
                case 6:
                        $rol = "Rol delivery";
                    break;
                default:
                    $rol = "ERROR";           
            }
            $_SESSION['id_usuario'] = $usuario['id'];
            $_SESSION['usuario'] = $usuario['nombreCompleto'];
            $_SESSION['email'] = $usuario['mail'];
            $_SESSION['tel'] = $usuario['telefono'];
            $_SESSION['fechaNacimiento'] = $usuario['fechaNacimiento'];
            $_SESSION['id_rol'] = $usuario['id_rol'];


            echo json_encode([
                "success" => true,
                "message" => "Haz iniciado sesión correctamente.",
                "nameRol" => $rol,
                "id_rol" => $rol_usuario,

            ]);
                exit;
            

        }else{
            echo json_encode([
            "success" => false,
            "message" => "La contraseña no es correcta. Verificala y intenta nuevamente."
            ]);
            exit;   
        }

    
    

    

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error al registrar: " . $e->getMessage()]);
}

    