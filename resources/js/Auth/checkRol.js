export async function checkRol() {
    const res = await fetch('/app/Functions/check.php?action=verificar', {
        credentials: "same-origin"
    });
    const data = await res.json();

    if (!data.success) {
        window.location.href = 'index.html';
        return null;
    }

    return parseInt(data.rol, 10);
}