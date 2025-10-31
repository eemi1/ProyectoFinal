#!/bin/bash
# --- backup.sh: genera un dump de la BD del proyecto ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.sh"
BACKUP_DIR="$SCRIPT_DIR/backups"

# shellcheck disable=SC1090
source "$CONFIG_FILE" || { echo "$(date) - No se pudo leer $CONFIG_FILE" >&2; exit 1; }

mkdir -p "$BACKUP_DIR"
fileName="$BACKUP_DIR/backup_$(date +%F_%H-%M-%S).sql"

/opt/lampp/bin/mysqldump -h 127.0.0.1 -u"$userDB" -p"$passDB" "$nameDB" > "$fileName"
rc=$?
if [ $rc -eq 0 ]; then
  echo "$(date) - OK - $fileName"
else
  echo "$(date) - ERROR($rc) generando backup" >&2
fi
