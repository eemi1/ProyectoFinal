<?php
include 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // --- Subir imagen si existe ---
    $rutaImagen = $_POST['imagen_actual'] ?? null; // por si ya hay una guardada
    if (!empty($_FILES['imagen']['name'])) {
        $carpeta = "uploads/";
        if (!is_dir($carpeta)) mkdir($carpeta, 0777, true);

        $nombreArchivo = time() . "_" . basename($_FILES['imagen']['name']);
        $rutaImagen = $carpeta . $nombreArchivo;
        move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaImagen);
    }

    // --- Datos del formulario ---
    $nombre = $_POST['nombre'];
    $capacidad = $_POST['capacidad_total'];
    $descripcion = $_POST['descripcion'];
    $telefono = $_POST['telefono'];
    $email = $_POST['email'];
    $direccion = $_POST['direccion'];

    // --- Actualizar el registro (único id = 1) ---
    $sql = "UPDATE configuracion SET 
                nombre=?, capacidad_total=?, descripcion=?, telefono=?, 
                email=?, direccion=?, imagenes=?, ultima_actualizacion=NOW() 
            WHERE id=1";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$nombre, $capacidad, $descripcion, $telefono, $email, $direccion, $rutaImagen]);

    echo "✅ Configuración actualizada correctamente.";
}
?>