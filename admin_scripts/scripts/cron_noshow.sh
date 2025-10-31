#!/bin/bash
# Script cron_noshow.sh — Detecta reservas con más de 15 min de atraso

LOG_FILE="/home/devadmin/proyecto/TenSW/logs/cron_noshow.log"
MYSQL="/opt/lampp/bin/mysql -u root"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] cron_noshow: ejecución OK" >> "$LOG_FILE"

$MYSQL fory_factory_db <<EOF
INSERT INTO noshow (id_reserva, penalizacion)
SELECT id, CONCAT('No show detectado ', NOW())
FROM reservas
WHERE estado = 'pendiente'
AND fechaReserva < (NOW() - INTERVAL 15 MINUTE)
AND id NOT IN (SELECT id_reserva FROM noshow);

UPDATE reservas
SET estado = 'no_show'
WHERE estado = 'pendiente'
AND fechaReserva < (NOW() - INTERVAL 15 MINUTE);
EOF
