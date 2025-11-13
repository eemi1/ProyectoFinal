<?php

require_once __DIR__ . '/../../../vendor/autoload.php'; // Ajusta si tu estructura es diferente

session_start();

// Crear el cliente de Google
$client = new Google_Client(['client_id' => '350728797977-cv03e2jicnvf65ot0acjb4q7l265r8qu.apps.googleusercontent.com']); // Reemplazá TU_CLIENT_ID

// Recibir el token enviado por el login de Google
$id_token = $_POST['credential'] ?? null;

if ($id_token) {
    $payload = $client->verifyIdToken($id_token);
    
    if ($payload) {
        // Datos del usuario
        $googleId = $payload['sub'];
        $name = $payload['name'];
        $email = $payload['email'];
        $picture = $payload['picture'];

        // Guardar en sesión (ejemplo)
        $_SESSION['user'] = [
            'id' => $googleId,
            'name' => $name,
            'email' => $email,
            'picture' => $picture
        ];

        // Aquí podrías verificar si el usuario ya existe en tu BD
        // y guardarlo si es nuevo.

        // Luego redirigir al dashboard
        header('Location: app/View/dashboard.php');
        exit;
    } else {
        echo "⚠️ Token inválido o expirado.";
    }
} else {
    echo "❌ No se recibió ningún token de Google.";
}
?>