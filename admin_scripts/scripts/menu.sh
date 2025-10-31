#!/bin/bash
# =========================================================
#  Menú de administración – ForyFactory (XAMPP / Ubuntu)
#  Requiere: config.sh en el mismo directorio
#  Usa MySQL de XAMPP: /opt/lampp/bin/mysql y mysqldump
# =========================================================

# ===== Colores =====
ROJO='\033[0;31m'
VERDE='\033[0;32m'
AMARILLO='\033[1;33m'
CIAN='\033[0;36m'
NC='\033[0m' # Sin color

# ===== Utilidades =====
_pause() { read -p "Presiona ENTER para continuar..." ; clear ; }

titulo() {
  local texto="$1"
  local ancho=49           # ancho total del marco
  local len=${#texto}
  local padding=$(( (ancho - len - 2) / 2 ))  # -2 por los "=" laterales

  echo -e "${AMARILLO}$(printf '=%.0s' $(seq 1 $ancho))${NC}"
  printf "${AMARILLO}=%*s%s%*s=${NC}\n" $padding "" "$texto" $((ancho - len - padding - 2)) ""
  echo -e "${AMARILLO}$(printf '=%.0s' $(seq 1 $ancho))${NC}"
}

# ====== Rutas/vars de Backups (todo relativo al menú) ======
__backup_vars() {
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  CONFIG_FILE="$SCRIPT_DIR/config.sh"
  BACKUP_DIR="$SCRIPT_DIR/backups"
  BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"
  LOG_FILE="$BACKUP_DIR/backup.log"
  CRON_MARK="# FORYFACTORY_BACKUP"
}

# =========================================================
#                         USUARIOS
# =========================================================
listarUsuarios() {
  echo -e "${CIAN}=== Lista de usuarios del sistema (usuario:uid:home) ===${NC}"
  getent passwd | cut -d: -f1,3,6
  _pause
}

agregarUsuario() {
  read -p "Ingrese el nombre del nuevo usuario: " newUser
  if [ -z "$newUser" ]; then echo -e "${ROJO}Nombre vacío.${NC}"; _pause; return; fi
  sudo adduser "$newUser"
  echo -e "${VERDE}Usuario creado correctamente.${NC}"
  _pause
}

eliminarUsuario() {
  read -p "Ingrese el nombre del usuario a eliminar: " nameUser
  if [ -z "$nameUser" ]; then echo -e "${ROJO}Nombre vacío.${NC}"; _pause; return; fi
  sudo userdel -r "$nameUser"
  echo -e "${VERDE}Usuario ${NC}$nameUser${VERDE} eliminado (si existía).${NC}"
  _pause
}

modificarUsuario() {
  while true; do
    titulo "Menú modificar usuario"
    echo -e "${CIAN}[1]${NC} - Cambiar nombre de usuario"
    echo -e "${CIAN}[2]${NC} - Cambiar grupo primario"
    echo -e "${CIAN}[3]${NC} - Añadir a grupos secundarios"
    echo -e "${CIAN}[4]${NC} - Bloquear / Desbloquear usuario"
    echo -e "${CIAN}[0]${NC} - Volver"
    echo ""
    read -p "Elige la opción: " opcionMenuModificarUsuario

    case "$opcionMenuModificarUsuario" in
      1)
        echo -e "${CIAN}Opción: Cambiar nombre de usuario${NC}"
        read -p "Nombre actual: " nameModify
        read -p "Nuevo nombre: " newNameModify
        read -p "Confirmar cambio de ${nameModify} -> ${newNameModify}? [Y/N]: " ok
        ok="${ok^^}"
        if [ "$ok" = "Y" ] && [ -n "$nameModify" ] && [ -n "$newNameModify" ]; then
          sudo usermod -l "$newNameModify" "$nameModify"
          sudo usermod -d "/home/$newNameModify" -m "$newNameModify"
          echo -e "${VERDE}Nombre cambiado correctamente.${NC}"
        else
          echo -e "${ROJO}Operación cancelada o datos inválidos.${NC}"
        fi
        _pause
        ;;
      2)
        echo -e "${CIAN}Opción: Cambiar grupo primario${NC}"
        read -p "Usuario: " nameUserGroup
        read -p "Nuevo grupo: " newGroupUser
        read -p "Confirmar? [Y/N]: " ok
        ok="${ok^^}"
        if [ "$ok" = "Y" ] && [ -n "$nameUserGroup" ] && [ -n "$newGroupUser" ]; then
          sudo usermod -g "$newGroupUser" "$nameUserGroup"
          echo -e "${VERDE}Grupo primario actualizado.${NC}"
        else
          echo -e "${ROJO}Operación cancelada o datos inválidos.${NC}"
        fi
        _pause
        ;;
      3)
        echo -e "${CIAN}Opción: Añadir a grupos secundarios${NC}"
        read -p "Usuario: " nameUserGroupSecondary
        read -p "Grupo secundario a añadir: " newGroupUserSecondary
        read -p "Confirmar? [Y/N]: " ok
        ok="${ok^^}"
        if [ "$ok" = "Y" ] && [ -n "$nameUserGroupSecondary" ] && [ -n "$newGroupUserSecondary" ]; then
          sudo usermod -aG "$newGroupUserSecondary" "$nameUserGroupSecondary"
          echo -e "${VERDE}Usuario añadido al grupo secundario.${NC}"
        else
          echo -e "${ROJO}Operación cancelada o datos inválidos.${NC}"
        fi
        _pause
        ;;
      4)
        echo -e "${CIAN}Opción: Bloquear / Desbloquear usuario${NC}"
        read -p "Usuario: " nameUserBlock
        read -p "Bloquear (B) o Desbloquear (D)? [B/D]: " action
        action="${action^^}"
        case "$action" in
          B) sudo usermod -L "$nameUserBlock"; echo -e "${VERDE}Usuario bloqueado.${NC}" ;;
          D) sudo usermod -U "$nameUserBlock"; echo -e "${VERDE}Usuario desbloqueado.${NC}" ;;
          *) echo -e "${ROJO}Opción no válida.${NC}" ;;
        esac
        _pause
        ;;
      0) break ;;
      *) echo -e "${ROJO}Opción no válida.${NC}" ; _pause ;;
    esac
  done
}

# =========================================================
#                       BASE DE DATOS
# =========================================================
mostrarTablasDB () {
  if [ ! -f ./config.sh ]; then echo -e "${ROJO}Falta ./config.sh${NC}"; _pause; return; fi
  # shellcheck disable=SC1091
  source ./config.sh
  titulo "Tablas de ${nameDB}"
  /opt/lampp/bin/mysql -h localhost -u"$userDB" -p"$passDB" -D"$nameDB" -e "SHOW TABLES;"
  _pause
}

consultarInfoTablaDB () {
  if [ ! -f ./config.sh ]; then echo -e "${ROJO}Falta ./config.sh${NC}"; _pause; return; fi
  # shellcheck disable=SC1091
  source ./config.sh
  read -p "Ingrese el nombre de la tabla a consultar: " nameTableDB
  read -p "¿Ver Columnas (C) o Datos (D)? [C/D]: " valueMenuInfoTableDB
  valueMenuInfoTableDB="${valueMenuInfoTableDB^^}"
  if [ -z "$nameTableDB" ]; then echo -e "${ROJO}Nombre de tabla vacío.${NC}"; _pause; return; fi

  titulo "Consulta: $nameTableDB"
  case "$valueMenuInfoTableDB" in
    C) /opt/lampp/bin/mysql -h localhost -u"$userDB" -p"$passDB" -D"$nameDB" -e "DESCRIBE \`$nameTableDB\`;" ;;
    D) /opt/lampp/bin/mysql -h localhost -u"$userDB" -p"$passDB" -D"$nameDB" -e "SELECT * FROM \`$nameTableDB\` LIMIT 50;" ;;
    *) echo -e "${ROJO}Opción no válida. Use 'C' o 'D'.${NC}" ;;
  esac
  _pause
}

# =========================================================
#                          BACKUPS
# =========================================================
# Crea/actualiza backup.sh (idempotente)
__asegurar_backup_script() {
  __backup_vars
  mkdir -p "$BACKUP_DIR"
  cat > "$BACKUP_SCRIPT" <<'EOF'
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
EOF
  chmod +x "$BACKUP_SCRIPT"
}

verBackupsBD () {
  __backup_vars
  titulo "Backups existentes"
  mkdir -p "$BACKUP_DIR"
  ls -lh "$BACKUP_DIR"
  echo ""
  echo -e "${CIAN}Programación actual (crontab):${NC}"
  (crontab -l 2>/dev/null | grep -n "$CRON_MARK") || echo "(sin programación)"
  _pause
}

backupManualBD () {
  __backup_vars
  if [ ! -f "$CONFIG_FILE" ]; then echo -e "${ROJO}Falta $CONFIG_FILE${NC}"; _pause; return; fi
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
  mkdir -p "$BACKUP_DIR"
  fileName="$BACKUP_DIR/backup_$(date +%F_%H-%M-%S).sql"
  /opt/lampp/bin/mysqldump -h 127.0.0.1 -u"$userDB" -p"$passDB" "$nameDB" > "$fileName"
  rc=$?
  if [ $rc -eq 0 ]; then
    echo -e "${VERDE}Backup OK:${NC} $fileName"
  else
    echo -e "${ROJO}ERROR($rc): no se pudo generar el backup.${NC}"
  fi
  _pause
}

programarBackupAutomatico() {
  __backup_vars
  __asegurar_backup_script

  titulo "Programar Backup Automático"
  echo -e "${CIAN}[1]${NC} Cada N minutos"
  echo -e "${CIAN}[2]${NC} Cada N horas"
  echo -e "${CIAN}[3]${NC} Diario a una hora"
  echo -e "${CIAN}[4]${NC} Semanal (día + hora)"
  echo -e "${CIAN}[5]${NC} Mensual (día del mes + hora)"
  echo -e "${CIAN}[0]${NC} Cancelar"
  echo ""
  read -p "Elegí una opción: " opt

  case "$opt" in
    1) read -p "Cada cuántos minutos? (1-59): " N; [ -z "$N" ] && echo -e "${ROJO}Valor vacío.${NC}" && _pause && return; SCHED="*/$N * * * *" ;;
    2) read -p "Cada cuántas horas? (1-23): " N; [ -z "$N" ] && echo -e "${ROJO}Valor vacío.${NC}" && _pause && return; SCHED="0 */$N * * *" ;;
    3) read -p "Hora (00-23): " H; read -p "Minuto (00-59): " M; SCHED="$M $H * * *" ;;
    4) echo "Día: 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb"
       read -p "Día (0-6): " D; read -p "Hora (00-23): " H; read -p "Minuto (00-59): " M; SCHED="$M $H * * $D" ;;
    5) read -p "Día del mes (1-28 recomendado): " DM; read -p "Hora (00-23): " H; read -p "Minuto (00-59): " M; SCHED="$M $H $DM * *" ;;
    0) echo -e "${AMARILLO}Cancelado.${NC}"; _pause; return ;;
    *) echo -e "${ROJO}Opción inválida.${NC}"; _pause; return ;;
  esac

  CRON_LINE="$SCHED PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin $BACKUP_SCRIPT >> $LOG_FILE 2>&1 $CRON_MARK"
  ( crontab -l 2>/dev/null | grep -v "$CRON_MARK" ; echo "$CRON_LINE" ) | crontab -
  echo -e "${VERDE}Backup automático programado.${NC}"
  echo "Línea en crontab:"
  echo "$CRON_LINE"
  _pause
}

eliminarProgramacionBackup() {
  __backup_vars
  if crontab -l 2>/dev/null | grep -q "$CRON_MARK"; then
    crontab -l 2>/dev/null | grep -v "$CRON_MARK" | crontab -
    echo -e "${VERDE}Programación de backup eliminada.${NC}"
  else
    echo -e "${AMARILLO}No hay programación registrada.${NC}"
  fi
  _pause
}

verProgramacionBackup() {
  __backup_vars
  titulo "Programación y Log"
  echo -e "${CIAN}Crontab:${NC}"
  (crontab -l 2>/dev/null | grep "$CRON_MARK" || echo "(sin programación)")
  echo ""
  echo -e "${CIAN}Últimas 10 líneas del log:${NC}"
  [ -f "$LOG_FILE" ] && tail -n 10 "$LOG_FILE" || echo "(aún no hay log)"
  _pause
}

menuBackups() {
  while true; do
    titulo "Menú de Backups"
    echo -e "${CIAN}[1]${NC} - Listar backups existentes"
    echo -e "${CIAN}[2]${NC} - Realizar backup manual"
    echo -e "${CIAN}[3]${NC} - Programar backup automático"
    echo -e "${CIAN}[4]${NC} - Ver programación y log"
    echo -e "${CIAN}[5]${NC} - Eliminar programación"
    echo -e "${CIAN}[0]${NC} - Volver"
    echo ""
    read -p "Elige una opción [0-5]: " opcionMenuBackup
    case "$opcionMenuBackup" in
      1) verBackupsBD ;;
      2) backupManualBD ;;
      3) programarBackupAutomatico ;;
      4) verProgramacionBackup ;;
      5) eliminarProgramacionBackup ;;
      0) break ;;
      *) echo -e "${ROJO}Opción no válida.${NC}" ;;
    esac
  done
}

# =========================================================
#                      CONEXIONES (NUEVO)
# =========================================================
pingGoogle() {
  titulo "Ping a google.com"
  ping -c 4 google.com
  echo ""
  # si traceroute está disponible, lo mostramos
  if command -v traceroute >/dev/null 2>&1; then
    echo -e "${CIAN}Traceroute a google.com:${NC}"
    traceroute -m 8 google.com
  else
    echo -e "${AMARILLO}(traceroute no instalado)${NC}"
  fi
  _pause
}

infoRedYSSH() {
  titulo "Resumen de Red y SSH"

  echo -e "${CIAN}Interfaces (IP abreviada):${NC}"
  ip -br a | sed 's/ \+/ /g'
  echo ""

  echo -e "${CIAN}Rutas:${NC}"
  ip r
  echo ""

  echo -e "${CIAN}DNS en uso:${NC}"
  if command -v resolvectl >/dev/null 2>&1; then
    resolvectl status | sed -n '1,40p'
  else
    cat /etc/resolv.conf
  fi
  echo ""

  echo -e "${CIAN}Hostname:${NC}"
  hostnamectl | egrep 'Static hostname|Operating System|Kernel'
  echo ""

  echo -e "${CIAN}Estado del servicio SSH:${NC}"
  systemctl is-enabled ssh 2>/dev/null | sed 's/^/  enabled: /'
  systemctl is-active ssh  2>/dev/null | sed 's/^/  active:  /'
  echo ""

  echo -e "${CIAN}Puertos en escucha (top 20):${NC}"
  if command -v ss >/dev/null 2>&1; then
    ss -tlpn | head -n 20
  else
    netstat -tlpn | head -n 20
  fi
  echo ""

  echo -e "${CIAN}Prueba de puerto 22 local:${NC}"
  if command -v nc >/dev/null 2>&1; then
    nc -zv 127.0.0.1 22 || true
  else
    echo -e "${AMARILLO}(nc no instalado)${NC}"
  fi
  echo ""

  # Reachability del gateway
  GW=$(ip r | awk '/default/ {print $3; exit}')
  if [ -n "$GW" ]; then
    echo -e "${CIAN}Ping a gateway ($GW):${NC}"
    ping -c 2 "$GW" || true
  fi

  _pause
}

menuConexiones() {
  while true; do
    titulo "Conexiones"
    echo -e "${CIAN}[1]${NC} - Ping a google.com (y traceroute si está)"
    echo -e "${CIAN}[2]${NC} - Ver IP, rutas, DNS, SSH y puertos"
    echo -e "${CIAN}[0]${NC} - Volver"
    echo ""
    read -p "Elige una opción [0-2]: " cop
    case "$cop" in
      1) pingGoogle ;;
      2) infoRedYSSH ;;
      0) break ;;
      *) echo -e "${ROJO}Opción no válida.${NC}" ; _pause ;;
    esac
  done
}

# =========================================================
#                       MENÚ PRINCIPAL
# =========================================================
while true; do
  clear
  titulo "Menú Administrador"
  echo -e "${CIAN}[1]${NC} - Usuarios"
  echo -e "${CIAN}[2]${NC} - Base de datos"
  echo -e "${CIAN}[3]${NC} - Backups"
  echo -e "${CIAN}[4]${NC} - Conexiones"
  echo -e "${CIAN}[0]${NC} - Salir"
  echo ""
  read -p "Elige una opción [0-4]: " opcionMenu

  case "$opcionMenu" in
    1)
      while true; do
        titulo "Menú Usuarios"
        echo -e "${CIAN}[1]${NC} - Listar Usuarios"
        echo -e "${CIAN}[2]${NC} - Agregar Usuario"
        echo -e "${CIAN}[3]${NC} - Eliminar Usuario"
        echo -e "${CIAN}[4]${NC} - Modificar Usuario"
        echo -e "${CIAN}[0]${NC} - Volver"
        echo ""
        read -p "Elige una opción [0-4]: " opcionMenuUsuarios
        case "$opcionMenuUsuarios" in
          1) listarUsuarios ;;
          2) agregarUsuario ;;
          3) eliminarUsuario ;;
          4) modificarUsuario ;;
          0) break ;;
          *) echo -e "${ROJO}Opción no válida.${NC}" ; _pause ;;
        esac
      done
      ;;
    2)
      while true; do
        titulo "Menú Base de datos"
        echo -e "${CIAN}[1]${NC} - Mostrar tablas de la base"
        echo -e "${CIAN}[2]${NC} - Consultar información de una tabla"
        echo -e "${CIAN}[0]${NC} - Volver"
        echo ""
        read -p "Elige una opción [0-2]: " opcionMenuBaseDeDatos
        case "$opcionMenuBaseDeDatos" in
          1) mostrarTablasDB ;;
          2) consultarInfoTablaDB ;;
          0) break ;;
          *) echo -e "${ROJO}Opción no válida.${NC}" ; _pause ;;
        esac
      done
      ;;
    3)
      menuBackups
      ;;
    4)
      menuConexiones
      ;;
    0)
      echo -e "${VERDE}Saliendo...${NC}"
      break
      ;;
    *)
      echo -e "${ROJO}Opción no válida.${NC}"
      _pause
      ;;
  esac
done
