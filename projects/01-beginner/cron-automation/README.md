# ⏰ Cron Automation & Scheduled Tasks

Automate system tasks with cron jobs and build robust backup/maintenance scripts.

## 🎯 Learning Objectives

- Understand cron syntax and scheduling
- Create automated backup scripts
- Implement log rotation
- Build monitoring alerts
- Handle script errors and notifications

## 📋 Prerequisites

- Basic Linux command line
- Shell scripting fundamentals
- Text editor (vim/nano)

## 🏗️ Cron Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CRON SYSTEM                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    CRON DAEMON (crond)                     │  │
│  │         Runs in background, checks every minute           │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│            ┌───────────────┼───────────────┐                    │
│            ▼               ▼               ▼                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  User        │ │  System      │ │  /etc/cron.d │            │
│  │  Crontabs    │ │  Crontab     │ │  Directory   │            │
│  │  (crontab -e)│ │  (/etc/cron) │ │              │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Schedule Format:                                                │
│  ┌──────── minute (0-59)                                        │
│  │ ┌────── hour (0-23)                                          │
│  │ │ ┌──── day of month (1-31)                                  │
│  │ │ │ ┌── month (1-12)                                         │
│  │ │ │ │ ┌ day of week (0-7, 0=7=Sunday)                        │
│  │ │ │ │ │                                                      │
│  * * * * * command                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Cron Basics

```bash
# View current user's crontab
crontab -l

# Edit crontab
crontab -e

# Common cron expressions
# ┌───────────── minute (0-59)
# │ ┌───────────── hour (0-23)
# │ │ ┌───────────── day of month (1-31)
# │ │ │ ┌───────────── month (1-12)
# │ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
# │ │ │ │ │
# * * * * * command

# Examples:
# Every minute
* * * * * /path/to/script.sh

# Every hour at minute 0
0 * * * * /path/to/script.sh

# Every day at 2:30 AM
30 2 * * * /path/to/script.sh

# Every Monday at 9 AM
0 9 * * 1 /path/to/script.sh

# Every 15 minutes
*/15 * * * * /path/to/script.sh

# First day of every month at midnight
0 0 1 * * /path/to/script.sh

# Every weekday at 6 PM
0 18 * * 1-5 /path/to/script.sh
```

### Lab 2: System Cron Directories

```bash
# System-wide cron directories
ls -la /etc/cron.d/          # Custom cron files
ls -la /etc/cron.daily/      # Runs daily
ls -la /etc/cron.hourly/     # Runs hourly
ls -la /etc/cron.weekly/     # Runs weekly
ls -la /etc/cron.monthly/    # Runs monthly

# View system crontab
cat /etc/crontab

# Create a system cron job
sudo cat << 'EOF' > /etc/cron.d/my-job
# Runs every 5 minutes as root
*/5 * * * * root /usr/local/bin/my-script.sh
EOF
```

### Lab 3: Backup Script

Create a comprehensive backup script:

```bash
#!/bin/bash
# backup.sh - Automated backup script

set -euo pipefail

# Configuration
BACKUP_SRC="/home/user/important-data"
BACKUP_DEST="/backup"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${DATE}.tar.gz"
LOG_FILE="/var/log/backup.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
cleanup() {
    if [[ $? -ne 0 ]]; then
        log "ERROR: Backup failed!"
        # Send alert (example with mail)
        # echo "Backup failed at $(date)" | mail -s "Backup Alert" admin@example.com
    fi
}
trap cleanup EXIT

# Start backup
log "Starting backup of $BACKUP_SRC"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DEST"

# Create compressed backup
tar -czf "${BACKUP_DEST}/${BACKUP_NAME}" -C "$(dirname "$BACKUP_SRC")" "$(basename "$BACKUP_SRC")" 2>> "$LOG_FILE"

# Verify backup
if [[ -f "${BACKUP_DEST}/${BACKUP_NAME}" ]]; then
    SIZE=$(du -h "${BACKUP_DEST}/${BACKUP_NAME}" | cut -f1)
    log "SUCCESS: Created ${BACKUP_NAME} (${SIZE})"
else
    log "ERROR: Backup file not created"
    exit 1
fi

# Remove old backups
log "Cleaning up backups older than ${RETENTION_DAYS} days"
find "$BACKUP_DEST" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# List current backups
log "Current backups:"
ls -lh "$BACKUP_DEST"/backup_*.tar.gz 2>/dev/null | tee -a "$LOG_FILE"

log "Backup completed successfully"
```

Install the backup cron job:
```bash
# Make executable
chmod +x /usr/local/bin/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup.sh") | crontab -
```

### Lab 4: Database Backup Script

```bash
#!/bin/bash
# db_backup.sh - Database backup with rotation

set -euo pipefail

# Configuration
DB_NAME="myapp"
DB_USER="backup_user"
DB_HOST="localhost"
BACKUP_DIR="/backup/database"
RETENTION_DAYS=14
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# PostgreSQL backup
pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" | gzip > "${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# MySQL backup (alternative)
# mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# Remove old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Verify
echo "Backup created: ${DB_NAME}_${DATE}.sql.gz"
echo "Size: $(du -h "${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz" | cut -f1)"
```

### Lab 5: Log Rotation Script

```bash
#!/bin/bash
# log_rotate.sh - Custom log rotation

LOG_DIR="/var/log/myapp"
MAX_SIZE_MB=100
KEEP_COMPRESSED=5

rotate_log() {
    local log_file="$1"
    local base_name=$(basename "$log_file")
    
    # Check if file exceeds max size
    local size_mb=$(du -m "$log_file" 2>/dev/null | cut -f1)
    
    if [[ ${size_mb:-0} -ge $MAX_SIZE_MB ]]; then
        echo "Rotating $log_file (${size_mb}MB)"
        
        # Rotate existing compressed files
        for i in $(seq $((KEEP_COMPRESSED-1)) -1 1); do
            if [[ -f "${log_file}.${i}.gz" ]]; then
                mv "${log_file}.${i}.gz" "${log_file}.$((i+1)).gz"
            fi
        done
        
        # Compress current log
        gzip -c "$log_file" > "${log_file}.1.gz"
        
        # Truncate original file (keeps file handle for running apps)
        : > "$log_file"
        
        # Remove oldest if exceeds retention
        rm -f "${log_file}.$((KEEP_COMPRESSED+1)).gz"
    fi
}

# Rotate all log files
for log in "$LOG_DIR"/*.log; do
    [[ -f "$log" ]] && rotate_log "$log"
done
```

### Lab 6: System Health Check Script

```bash
#!/bin/bash
# health_check.sh - System monitoring with alerts

# Thresholds
CPU_THRESHOLD=80
MEM_THRESHOLD=80
DISK_THRESHOLD=85
ALERT_EMAIL="admin@example.com"

# Check CPU usage
check_cpu() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print int($2)}')
    if [[ $cpu_usage -ge $CPU_THRESHOLD ]]; then
        echo "WARNING: CPU usage at ${cpu_usage}%"
        return 1
    fi
    echo "OK: CPU at ${cpu_usage}%"
}

# Check memory
check_memory() {
    local mem_usage=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')
    if [[ $mem_usage -ge $MEM_THRESHOLD ]]; then
        echo "WARNING: Memory usage at ${mem_usage}%"
        return 1
    fi
    echo "OK: Memory at ${mem_usage}%"
}

# Check disk space
check_disk() {
    local alerts=0
    while read -r line; do
        local usage=$(echo "$line" | awk '{print int($5)}')
        local mount=$(echo "$line" | awk '{print $6}')
        if [[ $usage -ge $DISK_THRESHOLD ]]; then
            echo "WARNING: Disk $mount at ${usage}%"
            alerts=$((alerts + 1))
        fi
    done < <(df -h | grep -E '^/dev')
    
    if [[ $alerts -eq 0 ]]; then
        echo "OK: All disks below ${DISK_THRESHOLD}%"
    fi
    return $alerts
}

# Check services
check_services() {
    local services=("nginx" "postgresql" "docker")
    for svc in "${services[@]}"; do
        if systemctl is-active --quiet "$svc" 2>/dev/null; then
            echo "OK: $svc is running"
        else
            echo "WARNING: $svc is not running"
        fi
    done
}

# Main
echo "=== System Health Check: $(date) ==="
echo ""
check_cpu
check_memory
check_disk
echo ""
check_services
```

## 📝 Project: Complete Automation System

Set up a full automation system:

```bash
# Create directory structure
mkdir -p /opt/automation/{scripts,logs,config}

# Create master crontab
cat << 'EOF' | sudo tee /etc/cron.d/automation
# Automation System Crontab
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=admin@example.com

# Health checks every 5 minutes
*/5 * * * * root /opt/automation/scripts/health_check.sh >> /opt/automation/logs/health.log 2>&1

# Backups daily at 2 AM
0 2 * * * root /opt/automation/scripts/backup.sh >> /opt/automation/logs/backup.log 2>&1

# Database backup every 6 hours
0 */6 * * * root /opt/automation/scripts/db_backup.sh >> /opt/automation/logs/db_backup.log 2>&1

# Log rotation daily at 3 AM
0 3 * * * root /opt/automation/scripts/log_rotate.sh >> /opt/automation/logs/rotation.log 2>&1

# Weekly system updates (Sunday 4 AM)
0 4 * * 0 root /opt/automation/scripts/system_update.sh >> /opt/automation/logs/updates.log 2>&1

# Monthly cleanup (First of month, 5 AM)
0 5 1 * * root /opt/automation/scripts/cleanup.sh >> /opt/automation/logs/cleanup.log 2>&1
EOF

# Verify cron syntax
cat /etc/cron.d/automation
```

## 🔧 Cron Expression Quick Reference

| Expression | Description |
|------------|-------------|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Daily at midnight |
| `0 2 * * *` | Daily at 2 AM |
| `0 0 * * 0` | Weekly on Sunday |
| `0 0 1 * *` | First day of month |
| `0 9-17 * * 1-5` | Hourly 9-5, weekdays |

## ✅ Completion Checklist

- [ ] Understand cron syntax
- [ ] Create user crontabs
- [ ] Build backup script with rotation
- [ ] Implement database backups
- [ ] Create log rotation script
- [ ] Set up health monitoring
- [ ] Configure email alerts
- [ ] Test failure handling

## 📚 Resources

- [Crontab Guru](https://crontab.guru/) - Cron expression editor
- [Linux Cron Manual](https://man7.org/linux/man-pages/man5/crontab.5.html)

---

**Next Project:** [Docker Basics](../../01-beginner/docker-basics/)
