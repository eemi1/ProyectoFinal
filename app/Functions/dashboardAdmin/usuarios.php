<?php
session_start();
header("Content-Type: application/json"); // Indica que la respuesta que va a devolver el servidor será en formato JSON.
require "../../../db.php";

try {
    $stmt = $pdo->prepare("SELECT * FROM usuario");
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$usuarios) {
        echo json_encode([
            "success" => false,
            "message" => "No se encontraron usuarios.",
        ]);
        exit;
    }

    foreach ($usuarios as &$usuario) {
        $rol_usuarios = $usuario['id_rol'];

        switch ($rol_usuarios) {
                case 1:
                        $rol = "Cliente";
                    break;
                case 2:
                        $rol = "Administrador";
                    break;
                case 3:
                        $rol = "Mozo";
                    break;
                case 4:
                        $rol = "Cocinero";
                    break;
                case 5:
                        $rol = "Gerente";
                    break;
                case 6:
                        $rol = "Delivery";
                    break;
                default:
                    $rol = "ERROR";           
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

    