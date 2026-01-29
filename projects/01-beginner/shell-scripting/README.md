# 📜 Shell Scripting for DevOps

Automate repetitive tasks with powerful Bash scripts.

## 🎯 Learning Objectives

- Write maintainable shell scripts
- Use variables, conditionals, and loops
- Handle errors gracefully
- Parse command-line arguments
- Create reusable functions

## 📋 Prerequisites

- Completed Linux Essentials project
- Bash shell access

## 🔬 Hands-On Labs

### Lab 1: Script Basics
```bash
#!/bin/bash
# hello.sh - First script

# Variables
NAME="DevOps Engineer"
DATE=$(date +%Y-%m-%d)

echo "Hello, $NAME!"
echo "Today is: $DATE"
echo "You're running: $SHELL"
echo "Home directory: $HOME"
```

### Lab 2: Conditionals
```bash
#!/bin/bash
# check-service.sh

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Usage: $0 <service-name>"
    exit 1
fi

if systemctl is-active --quiet "$SERVICE"; then
    echo "✅ $SERVICE is running"
else
    echo "❌ $SERVICE is not running"
    echo "Starting $SERVICE..."
    sudo systemctl start "$SERVICE"
fi
```

### Lab 3: Loops
```bash
#!/bin/bash
# deploy-apps.sh

APPS=("nginx" "redis" "postgres")

for app in "${APPS[@]}"; do
    echo "Deploying $app..."
    docker pull "$app:latest"
    echo "✅ $app deployed"
done

# Process files
for file in /var/log/*.log; do
    size=$(du -h "$file" | cut -f1)
    echo "$file: $size"
done
```

### Lab 4: Functions
```bash
#!/bin/bash
# utils.sh

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

check_command() {
    if command -v "$1" &> /dev/null; then
        log_info "$1 is installed"
        return 0
    else
        log_error "$1 is not installed"
        return 1
    fi
}

# Usage
check_command docker || exit 1
log_info "All checks passed"
```

### Lab 5: Error Handling
```bash
#!/bin/bash
# safe-deploy.sh

set -euo pipefail

trap 'echo "Error on line $LINENO"; exit 1' ERR

cleanup() {
    echo "Cleaning up temporary files..."
    rm -rf /tmp/deploy-*
}
trap cleanup EXIT

# Main deployment logic
main() {
    echo "Starting deployment..."
    
    if [ ! -f "docker-compose.yml" ]; then
        echo "docker-compose.yml not found!"
        exit 1
    fi
    
    docker compose up -d
    echo "Deployment complete!"
}

main "$@"
```

## 📝 Project: System Health Monitor

Create a comprehensive system health check script:

```bash
#!/bin/bash
# health-check.sh

set -euo pipefail

# Configuration
THRESHOLD_CPU=80
THRESHOLD_MEM=80
THRESHOLD_DISK=90

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    local status=$1
    local message=$2
    case $status in
        OK)      echo -e "${GREEN}[OK]${NC} $message" ;;
        WARN)    echo -e "${YELLOW}[WARN]${NC} $message" ;;
        ERROR)   echo -e "${RED}[ERROR]${NC} $message" ;;
    esac
}

check_cpu() {
    local cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local cpu_int=${cpu%.*}
    
    if [ "$cpu_int" -lt "$THRESHOLD_CPU" ]; then
        print_status "OK" "CPU: ${cpu}%"
    else
        print_status "WARN" "CPU: ${cpu}% (threshold: ${THRESHOLD_CPU}%)"
    fi
}

check_memory() {
    local mem=$(free | awk '/Mem:/ {printf "%.1f", $3/$2 * 100}')
    local mem_int=${mem%.*}
    
    if [ "$mem_int" -lt "$THRESHOLD_MEM" ]; then
        print_status "OK" "Memory: ${mem}%"
    else
        print_status "WARN" "Memory: ${mem}% (threshold: ${THRESHOLD_MEM}%)"
    fi
}

check_disk() {
    while read -r line; do
        local usage=$(echo "$line" | awk '{print $5}' | tr -d '%')
        local mount=$(echo "$line" | awk '{print $6}')
        
        if [ "$usage" -lt "$THRESHOLD_DISK" ]; then
            print_status "OK" "Disk $mount: ${usage}%"
        else
            print_status "ERROR" "Disk $mount: ${usage}% (threshold: ${THRESHOLD_DISK}%)"
        fi
    done < <(df -h | grep '^/dev')
}

check_services() {
    local services=("docker" "sshd")
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            print_status "OK" "Service: $service running"
        else
            print_status "ERROR" "Service: $service not running"
        fi
    done
}

main() {
    echo "========================================="
    echo "System Health Check - $(date)"
    echo "========================================="
    echo ""
    
    echo "📊 System Resources"
    check_cpu
    check_memory
    echo ""
    
    echo "💾 Disk Usage"
    check_disk
    echo ""
    
    echo "🔧 Services"
    check_services
    echo ""
    
    echo "========================================="
    echo "Health check complete!"
}

main "$@"
```

## ✅ Completion Checklist

- [ ] Write scripts with proper shebang and permissions
- [ ] Use variables and command substitution
- [ ] Implement conditionals (if/else, case)
- [ ] Create loops (for, while)
- [ ] Write reusable functions
- [ ] Handle errors with set -euo pipefail
- [ ] Parse command-line arguments
- [ ] Complete health monitor project

## 📚 Resources

- [Bash Scripting Guide](https://tldp.org/LDP/abs/html/)
- [ShellCheck](https://www.shellcheck.net/) - Script linter
- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/)

---

**Next Project:** [Git Workflows](../git-workflows/)
