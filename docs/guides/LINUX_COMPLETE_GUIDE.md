# 🐧 Complete Linux Administration Guide

A comprehensive guide covering everything you need to know about Linux for DevOps and Platform Engineering.

---

## Table of Contents

1. [Linux Fundamentals](#1-linux-fundamentals)
2. [File System & Navigation](#2-file-system--navigation)
3. [User & Permission Management](#3-user--permission-management)
4. [Process Management](#4-process-management)
5. [Package Management](#5-package-management)
6. [Networking](#6-networking)
7. [System Services](#7-system-services)
8. [Storage & Disk Management](#8-storage--disk-management)
9. [Shell Scripting](#9-shell-scripting)
10. [Security Hardening](#10-security-hardening)
11. [Performance Monitoring](#11-performance-monitoring)
12. [Log Management](#12-log-management)

---

## 1. Linux Fundamentals

### Linux Distributions

| Distribution | Use Case | Package Manager |
|--------------|----------|-----------------|
| Ubuntu/Debian | General purpose, servers | apt |
| CentOS/RHEL/Rocky | Enterprise servers | dnf/yum |
| Alpine | Containers (minimal) | apk |
| Amazon Linux | AWS environments | dnf/yum |

### Kernel Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     USER SPACE                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Shell  │  │  Apps   │  │ Services│  │ Libraries│       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       └────────────┴────────────┴────────────┘             │
│                         │                                   │
│                    System Calls                             │
├─────────────────────────┼──────────────────────────────────┤
│                   KERNEL SPACE                              │
│  ┌─────────────────────┴─────────────────────────┐        │
│  │                   Kernel                       │        │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │        │
│  │  │ Process  │ │  Memory  │ │   I/O    │      │        │
│  │  │ Manager  │ │ Manager  │ │ Manager  │      │        │
│  │  └──────────┘ └──────────┘ └──────────┘      │        │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │        │
│  │  │  File    │ │ Network  │ │  Device  │      │        │
│  │  │ Systems  │ │  Stack   │ │ Drivers  │      │        │
│  │  └──────────┘ └──────────┘ └──────────┘      │        │
│  └───────────────────────────────────────────────┘        │
├────────────────────────────────────────────────────────────┤
│                      HARDWARE                               │
│  CPU  │  Memory  │  Storage  │  Network  │  Peripherals   │
└────────────────────────────────────────────────────────────┘
```

### Essential Commands

```bash
# System information
uname -a                    # Kernel version and system info
cat /etc/os-release         # Distribution info
hostnamectl                 # Hostname and OS details
lscpu                       # CPU information
free -h                     # Memory usage
df -h                       # Disk space
uptime                      # System uptime and load
```

---

## 2. File System & Navigation

### Linux Directory Structure

```
/
├── bin/          # Essential user binaries
├── boot/         # Boot loader files
├── dev/          # Device files
├── etc/          # System configuration files
├── home/         # User home directories
├── lib/          # Shared libraries
├── media/        # Removable media mount points
├── mnt/          # Temporary mount points
├── opt/          # Optional software packages
├── proc/         # Process and kernel info (virtual)
├── root/         # Root user home directory
├── run/          # Runtime data
├── sbin/         # System binaries
├── srv/          # Service data
├── sys/          # Kernel and device info (virtual)
├── tmp/          # Temporary files
├── usr/          # User programs and data
│   ├── bin/      # User binaries
│   ├── lib/      # Libraries
│   ├── local/    # Locally installed software
│   └── share/    # Shared data
└── var/          # Variable data (logs, cache)
    ├── log/      # System logs
    ├── cache/    # Application cache
    └── lib/      # Application state data
```

### Navigation Commands

```bash
# Basic navigation
pwd                         # Print working directory
cd /path/to/dir             # Change directory
cd ~                        # Go to home directory
cd -                        # Go to previous directory
cd ..                       # Go up one level

# Listing files
ls                          # List files
ls -la                      # Long format with hidden files
ls -lh                      # Human-readable sizes
ls -ltr                     # Sort by time (oldest first)
ls -S                       # Sort by size
ls -R                       # Recursive listing

# File information
file filename               # Determine file type
stat filename               # Detailed file statistics
du -sh directory            # Directory size
du -sh * | sort -h          # Size of all items, sorted
```

### File Operations

```bash
# Creating files and directories
touch file.txt              # Create empty file
mkdir directory             # Create directory
mkdir -p path/to/nested     # Create nested directories

# Copying
cp source dest              # Copy file
cp -r source dest           # Copy directory recursively
cp -a source dest           # Archive mode (preserve attributes)
cp -v source dest           # Verbose (show what's being copied)

# Moving/Renaming
mv source dest              # Move or rename
mv file1 file2 dir/         # Move multiple files

# Deleting
rm file                     # Remove file
rm -r directory             # Remove directory recursively
rm -rf directory            # Force remove (DANGEROUS!)
rmdir empty_directory       # Remove empty directory

# Linking
ln source link              # Create hard link
ln -s source link           # Create symbolic link
readlink -f link            # Resolve symbolic link
```

### File Content Operations

```bash
# Viewing files
cat file                    # Display entire file
less file                   # Page through file (q to quit)
head -n 20 file             # First 20 lines
tail -n 20 file             # Last 20 lines
tail -f file                # Follow file (live updates)

# Searching within files
grep "pattern" file         # Search for pattern
grep -r "pattern" dir/      # Recursive search
grep -i "pattern" file      # Case insensitive
grep -n "pattern" file      # Show line numbers
grep -v "pattern" file      # Invert match (exclude)
grep -E "regex" file        # Extended regex
grep -c "pattern" file      # Count matches

# Finding files
find /path -name "*.txt"    # Find by name
find /path -type f          # Find files only
find /path -type d          # Find directories only
find /path -mtime -7        # Modified in last 7 days
find /path -size +100M      # Files larger than 100MB
find /path -perm 755        # Find by permissions
find /path -user root       # Find by owner
find /path -exec cmd {} \;  # Execute command on results

# Text processing
sort file                   # Sort lines
sort -n file                # Numeric sort
sort -r file                # Reverse sort
uniq file                   # Remove duplicates (sorted input)
wc -l file                  # Count lines
wc -w file                  # Count words
cut -d: -f1 /etc/passwd     # Extract first field
awk '{print $1}' file       # Print first column
sed 's/old/new/g' file      # Replace text
```

---

## 3. User & Permission Management

### User Management

```bash
# User information
whoami                      # Current user
id                          # User ID and groups
id username                 # Info for specific user
groups                      # List groups for current user
cat /etc/passwd             # All users
cat /etc/group              # All groups
cat /etc/shadow             # Password hashes (root only)

# Creating users
useradd username            # Create user (basic)
useradd -m username         # Create with home directory
useradd -m -s /bin/bash username  # Specify shell
useradd -m -G sudo,docker username  # Add to groups

adduser username            # Interactive user creation (Debian)

# Modifying users
usermod -aG groupname user  # Add user to group
usermod -s /bin/zsh user    # Change shell
usermod -L username         # Lock account
usermod -U username         # Unlock account

# Deleting users
userdel username            # Delete user
userdel -r username         # Delete user and home directory

# Password management
passwd                      # Change own password
passwd username             # Change user's password (root)
chage -l username           # Password aging info
chage -M 90 username        # Set max password age

# Groups
groupadd groupname          # Create group
groupdel groupname          # Delete group
gpasswd -a user group       # Add user to group
gpasswd -d user group       # Remove user from group
```

### File Permissions

```bash
# Permission structure
# -rwxrwxrwx = type + owner + group + others
# type: - (file), d (directory), l (link)
# rwx: read (4), write (2), execute (1)

# Viewing permissions
ls -l file                  # Show permissions

# Examples:
# -rw-r--r--  = 644 (file, owner rw, group r, others r)
# drwxr-xr-x  = 755 (dir, owner rwx, group rx, others rx)
# -rwx------  = 700 (file, owner rwx, no access for others)

# Changing permissions (symbolic)
chmod u+x file              # Add execute for owner
chmod g+w file              # Add write for group
chmod o-r file              # Remove read for others
chmod a+r file              # Add read for all
chmod u=rwx,g=rx,o=r file   # Set specific permissions

# Changing permissions (numeric)
chmod 755 file              # rwxr-xr-x
chmod 644 file              # rw-r--r--
chmod 700 file              # rwx------
chmod 600 file              # rw-------
chmod -R 755 directory      # Recursive

# Changing ownership
chown user file             # Change owner
chown user:group file       # Change owner and group
chown -R user:group dir     # Recursive
chgrp groupname file        # Change group only

# Special permissions
chmod u+s file              # SUID (run as owner)
chmod g+s directory         # SGID (inherit group)
chmod +t directory          # Sticky bit (only owner can delete)

# Default permissions
umask                       # Show current umask
umask 022                   # Set umask (default: 755 dirs, 644 files)
umask 077                   # Restrictive (700 dirs, 600 files)
```

### Access Control Lists (ACLs)

```bash
# Install ACL tools
apt install acl             # Debian/Ubuntu
dnf install acl             # RHEL/CentOS

# View ACLs
getfacl file

# Set ACLs
setfacl -m u:username:rwx file    # Give user access
setfacl -m g:groupname:rx file    # Give group access
setfacl -m o::r file              # Set others permissions
setfacl -x u:username file        # Remove user ACL
setfacl -b file                   # Remove all ACLs
setfacl -R -m u:user:rx dir       # Recursive
setfacl -d -m u:user:rx dir       # Default ACL for new files
```

---

## 4. Process Management

### Viewing Processes

```bash
# Process listing
ps                          # Current user processes
ps aux                      # All processes, detailed
ps -ef                      # All processes, full format
ps aux | grep nginx         # Find specific process
ps -u username              # Processes by user
ps --forest                 # Show process tree
pstree                      # Visual process tree

# Real-time monitoring
top                         # Interactive process viewer
htop                        # Enhanced top (install separately)
atop                        # Advanced top

# Top commands:
# - Press 'k' to kill a process
# - Press 'r' to renice a process
# - Press 'f' to select fields
# - Press 'M' to sort by memory
# - Press 'P' to sort by CPU
# - Press 'q' to quit

# Process information
pidof nginx                 # Get PID of process
pgrep -l nginx              # Find processes by name
```

### Process Control

```bash
# Starting processes
command &                   # Run in background
nohup command &             # Run immune to hangups
nohup command > output.log 2>&1 &  # With output redirect

# Job control
jobs                        # List background jobs
fg %1                       # Bring job 1 to foreground
bg %1                       # Send job 1 to background
Ctrl+Z                      # Suspend current process
Ctrl+C                      # Terminate current process

# Signals
kill PID                    # Send SIGTERM (graceful)
kill -9 PID                 # Send SIGKILL (force)
kill -HUP PID               # Send SIGHUP (reload config)
kill -STOP PID              # Pause process
kill -CONT PID              # Resume process
killall processname         # Kill by name
pkill pattern               # Kill by pattern

# Common signals:
# SIGTERM (15) - Graceful termination
# SIGKILL (9)  - Force kill (cannot be caught)
# SIGHUP (1)   - Hangup (often used for reload)
# SIGSTOP (19) - Pause process
# SIGCONT (18) - Continue process

# Priority
nice -n 10 command          # Start with lower priority
nice -n -10 command         # Start with higher priority (root)
renice 10 -p PID            # Change priority of running process
```

### System Resources

```bash
# Memory
free -h                     # Memory usage
cat /proc/meminfo           # Detailed memory info
vmstat 1                    # Virtual memory statistics

# CPU
mpstat 1                    # CPU statistics
lscpu                       # CPU information
cat /proc/cpuinfo           # Detailed CPU info

# Load average
uptime                      # Load averages
w                           # Who is logged in + load

# I/O
iostat 1                    # I/O statistics
iotop                       # I/O by process (needs install)

# Open files
lsof                        # List open files
lsof -i :80                 # Files using port 80
lsof -u username            # Files opened by user
lsof +D /path               # Files in directory
```

---

## 5. Package Management

### Debian/Ubuntu (APT)

```bash
# Update package lists
apt update

# Upgrade packages
apt upgrade                 # Upgrade installed packages
apt full-upgrade            # Upgrade with dependency changes
apt dist-upgrade            # Distribution upgrade

# Install packages
apt install package         # Install package
apt install package1 package2  # Multiple packages
apt install ./package.deb   # Install local .deb file

# Remove packages
apt remove package          # Remove package
apt purge package           # Remove package + config files
apt autoremove              # Remove unused dependencies

# Search and info
apt search keyword          # Search packages
apt show package            # Package information
apt list --installed        # List installed packages
apt list --upgradable       # List upgradable packages

# Repository management
add-apt-repository ppa:name # Add PPA repository
apt-key adv --keyserver ... # Add GPG key

# Package cache
apt clean                   # Clear package cache
apt autoclean               # Clear old package cache

# dpkg (low-level)
dpkg -i package.deb         # Install .deb file
dpkg -r package             # Remove package
dpkg -l                     # List installed packages
dpkg -L package             # List files in package
dpkg -S /path/to/file       # Find package owning file
```

### RHEL/CentOS/Fedora (DNF/YUM)

```bash
# Update
dnf check-update            # Check for updates
dnf update                  # Update all packages
dnf upgrade                 # Same as update

# Install
dnf install package         # Install package
dnf install package-1.0     # Install specific version
dnf localinstall file.rpm   # Install local RPM

# Remove
dnf remove package          # Remove package
dnf autoremove              # Remove unused dependencies

# Search and info
dnf search keyword          # Search packages
dnf info package            # Package information
dnf list installed          # List installed
dnf list available          # List available
dnf provides /path/to/file  # Find package providing file

# Groups
dnf group list              # List package groups
dnf group install "group"   # Install group

# Repository management
dnf repolist                # List repositories
dnf config-manager --add-repo URL  # Add repository

# History
dnf history                 # View transaction history
dnf history undo ID         # Undo transaction

# rpm (low-level)
rpm -ivh package.rpm        # Install RPM
rpm -e package              # Remove package
rpm -qa                     # List all packages
rpm -ql package             # List files in package
rpm -qf /path/to/file       # Find package owning file
```

### Alpine (APK)

```bash
# Update
apk update                  # Update package index
apk upgrade                 # Upgrade all packages

# Install/Remove
apk add package             # Install package
apk del package             # Remove package

# Search and info
apk search keyword          # Search packages
apk info package            # Package info
apk info -L package         # List files in package
```

---

## 6. Networking

### Network Configuration

```bash
# IP addresses
ip addr                     # Show IP addresses
ip addr show eth0           # Show specific interface
ip addr add 10.0.0.1/24 dev eth0  # Add IP address
ip addr del 10.0.0.1/24 dev eth0  # Remove IP address

# Interfaces
ip link show                # Show network interfaces
ip link set eth0 up         # Enable interface
ip link set eth0 down       # Disable interface

# Routing
ip route                    # Show routing table
ip route add default via 10.0.0.1  # Add default gateway
ip route add 192.168.1.0/24 via 10.0.0.2  # Add route

# DNS
cat /etc/resolv.conf        # DNS configuration
systemd-resolve --status    # DNS status (systemd)

# Hostname
hostname                    # Show hostname
hostnamectl set-hostname name  # Set hostname
cat /etc/hosts              # Hosts file
```

### Network Diagnostics

```bash
# Connectivity
ping host                   # ICMP ping
ping -c 4 host              # Ping 4 times
ping6 host                  # IPv6 ping

# DNS
nslookup domain             # DNS lookup
dig domain                  # Detailed DNS lookup
dig +short domain           # Short output
host domain                 # Simple lookup

# Ports and connections
ss -tuln                    # Listening ports (TCP/UDP)
ss -tunap                   # All connections with process
ss -s                       # Socket statistics
netstat -tuln               # Alternative (older)
lsof -i :80                 # What's using port 80

# Tracing
traceroute host             # Trace route to host
mtr host                    # Combined ping and traceroute

# HTTP testing
curl http://example.com     # GET request
curl -I http://example.com  # Headers only
curl -X POST -d "data" URL  # POST request
curl -o file URL            # Download to file
wget URL                    # Download file

# Network scanning
nmap host                   # Port scan
nmap -sV host               # Service version detection
nmap -A host                # Aggressive scan
```

### Firewall (iptables/nftables)

```bash
# iptables (legacy)
iptables -L                 # List rules
iptables -L -n -v           # Verbose with numbers
iptables -A INPUT -p tcp --dport 22 -j ACCEPT  # Allow SSH
iptables -A INPUT -p tcp --dport 80 -j ACCEPT  # Allow HTTP
iptables -A INPUT -j DROP   # Drop all other INPUT
iptables -D INPUT 1         # Delete rule 1
iptables -F                 # Flush all rules

# Save/restore
iptables-save > /etc/iptables.rules
iptables-restore < /etc/iptables.rules

# UFW (Ubuntu Firewall)
ufw status                  # Show status
ufw enable                  # Enable firewall
ufw disable                 # Disable firewall
ufw allow 22                # Allow port
ufw allow ssh               # Allow by service name
ufw deny 23                 # Deny port
ufw delete allow 22         # Remove rule
ufw reset                   # Reset to defaults

# firewalld (RHEL/CentOS)
firewall-cmd --state        # Check status
firewall-cmd --list-all     # List all rules
firewall-cmd --add-port=80/tcp --permanent  # Add port
firewall-cmd --add-service=http --permanent # Add service
firewall-cmd --reload       # Apply changes
```

---

## 7. System Services

### Systemd

```bash
# Service management
systemctl status service    # Check service status
systemctl start service     # Start service
systemctl stop service      # Stop service
systemctl restart service   # Restart service
systemctl reload service    # Reload configuration
systemctl enable service    # Enable at boot
systemctl disable service   # Disable at boot
systemctl is-active service # Check if running
systemctl is-enabled service  # Check if enabled

# List services
systemctl list-units        # List all active units
systemctl list-units --type=service  # Only services
systemctl list-units --failed  # Failed units
systemctl list-unit-files   # All unit files

# Logs
journalctl                  # All logs
journalctl -u service       # Logs for service
journalctl -f               # Follow logs (live)
journalctl -f -u service    # Follow service logs
journalctl --since "1 hour ago"  # Recent logs
journalctl -p err           # Only errors
journalctl -b               # Logs since boot
journalctl --disk-usage     # Journal disk usage

# System state
systemctl get-default       # Default target
systemctl set-default multi-user.target  # Set default
systemctl isolate rescue.target  # Enter rescue mode
systemctl reboot            # Reboot
systemctl poweroff          # Shutdown
```

### Creating Custom Services

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Application
Documentation=https://example.com/docs
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=appuser
Group=appgroup
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/start.sh
ExecStop=/opt/myapp/bin/stop.sh
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production
EnvironmentFile=/opt/myapp/.env

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/var/lib/myapp

[Install]
WantedBy=multi-user.target
```

```bash
# Apply new service
systemctl daemon-reload
systemctl enable myapp
systemctl start myapp
```

---

## 8. Storage & Disk Management

### Disk Information

```bash
# List disks and partitions
lsblk                       # Block devices
lsblk -f                    # With filesystem info
fdisk -l                    # Detailed partition info
blkid                       # Block device IDs

# Disk usage
df -h                       # Filesystem usage
df -i                       # Inode usage
du -sh /path                # Directory size
du -sh * | sort -h          # Sorted directory sizes
ncdu /path                  # Interactive disk usage
```

### Partitioning

```bash
# Partition tools
fdisk /dev/sda              # MBR partition editor
gdisk /dev/sda              # GPT partition editor
parted /dev/sda             # GNU parted

# fdisk commands:
# p - print partition table
# n - new partition
# d - delete partition
# t - change partition type
# w - write changes
# q - quit without saving

# Create filesystem
mkfs.ext4 /dev/sda1         # Create ext4 filesystem
mkfs.xfs /dev/sda1          # Create XFS filesystem
mkfs.vfat /dev/sda1         # Create FAT filesystem

# Check filesystem
fsck /dev/sda1              # Check and repair
e2fsck -f /dev/sda1         # Force check ext filesystem
```

### Mounting

```bash
# Mount filesystem
mount /dev/sda1 /mnt        # Mount device
mount -t nfs server:/share /mnt  # Mount NFS
mount -o loop disk.iso /mnt # Mount ISO

# Unmount
umount /mnt                 # Unmount by mount point
umount /dev/sda1            # Unmount by device

# Permanent mounts (/etc/fstab)
# device       mount-point  type   options        dump pass
/dev/sda1      /data        ext4   defaults       0    2
UUID=xxx       /backup      xfs    defaults,nofail 0   2
server:/share  /nfs         nfs    defaults       0    0

# Apply fstab
mount -a                    # Mount all from fstab
```

### LVM (Logical Volume Manager)

```bash
# Physical Volumes
pvcreate /dev/sdb /dev/sdc  # Create PVs
pvs                         # List PVs
pvdisplay                   # Detailed PV info

# Volume Groups
vgcreate vg_data /dev/sdb /dev/sdc  # Create VG
vgs                         # List VGs
vgextend vg_data /dev/sdd   # Add PV to VG
vgdisplay                   # Detailed VG info

# Logical Volumes
lvcreate -L 100G -n lv_data vg_data  # Create 100GB LV
lvcreate -l 100%FREE -n lv_data vg_data  # Use all space
lvs                         # List LVs
lvextend -L +50G /dev/vg_data/lv_data  # Extend by 50GB
lvreduce -L 50G /dev/vg_data/lv_data   # Reduce to 50GB
lvdisplay                   # Detailed LV info

# Resize filesystem after LV extend
resize2fs /dev/vg_data/lv_data  # For ext4
xfs_growfs /mountpoint      # For XFS
```

---

## 9. Shell Scripting

### Bash Basics

```bash
#!/bin/bash
# Shebang - specifies interpreter

# Variables
NAME="World"
echo "Hello, $NAME"
echo "Hello, ${NAME}!"

# Command substitution
DATE=$(date +%Y-%m-%d)
FILES=`ls -la`

# Arithmetic
result=$((5 + 3))
((count++))
let "result = 5 * 3"

# Arrays
arr=("one" "two" "three")
echo ${arr[0]}              # First element
echo ${arr[@]}              # All elements
echo ${#arr[@]}             # Array length

# String operations
str="Hello World"
echo ${#str}                # String length
echo ${str:0:5}             # Substring (Hello)
echo ${str/World/Linux}     # Replace
```

### Control Structures

```bash
# If statement
if [ condition ]; then
    commands
elif [ condition ]; then
    commands
else
    commands
fi

# Conditions
[ -f file ]     # File exists
[ -d dir ]      # Directory exists
[ -r file ]     # File is readable
[ -w file ]     # File is writable
[ -x file ]     # File is executable
[ -z "$var" ]   # Variable is empty
[ -n "$var" ]   # Variable is not empty
[ "$a" = "$b" ] # Strings are equal
[ "$a" != "$b" ]# Strings not equal
[ $a -eq $b ]   # Numbers equal
[ $a -ne $b ]   # Numbers not equal
[ $a -lt $b ]   # Less than
[ $a -gt $b ]   # Greater than

# Logical operators
[ condition1 ] && [ condition2 ]  # AND
[ condition1 ] || [ condition2 ]  # OR
! [ condition ]                   # NOT

# For loop
for item in list; do
    echo $item
done

for i in {1..10}; do
    echo $i
done

for file in *.txt; do
    echo "Processing $file"
done

for ((i=0; i<10; i++)); do
    echo $i
done

# While loop
while [ condition ]; do
    commands
done

while read line; do
    echo $line
done < file.txt

# Case statement
case $variable in
    pattern1)
        commands
        ;;
    pattern2|pattern3)
        commands
        ;;
    *)
        default commands
        ;;
esac
```

### Functions

```bash
# Function definition
function_name() {
    local var="local variable"
    echo "Argument 1: $1"
    echo "Argument 2: $2"
    echo "All arguments: $@"
    echo "Number of arguments: $#"
    return 0
}

# Call function
function_name arg1 arg2

# Capture return value
result=$(function_name arg1)
exit_code=$?
```

### Error Handling

```bash
#!/bin/bash
set -e          # Exit on error
set -u          # Exit on undefined variable
set -o pipefail # Exit on pipe failure
set -x          # Debug mode (print commands)

# Combined
set -euo pipefail

# Trap errors
trap 'echo "Error on line $LINENO"; exit 1' ERR

# Cleanup on exit
cleanup() {
    echo "Cleaning up..."
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Error handling example
if ! command; then
    echo "Command failed" >&2
    exit 1
fi

command || { echo "Failed"; exit 1; }
```

### Complete Script Example

```bash
#!/bin/bash
set -euo pipefail

# Script: backup.sh
# Description: Backup directories with logging

# Configuration
BACKUP_DIR="/backup"
LOG_FILE="/var/log/backup.log"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "This script must be run as root"
        exit 1
    fi
}

# Create backup
create_backup() {
    local source=$1
    local name=$(basename "$source")
    local backup_file="${BACKUP_DIR}/${name}_${DATE}.tar.gz"
    
    log "INFO" "Backing up $source to $backup_file"
    
    if tar -czf "$backup_file" -C "$(dirname "$source")" "$name"; then
        log "INFO" "Backup completed: $(du -h "$backup_file" | cut -f1)"
        return 0
    else
        log "ERROR" "Backup failed for $source"
        return 1
    fi
}

# Cleanup old backups
cleanup_old() {
    log "INFO" "Cleaning up backups older than $RETENTION_DAYS days"
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
}

# Main function
main() {
    check_root
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    log "INFO" "Starting backup process"
    
    # Backup directories
    local directories=("/etc" "/home" "/var/www")
    local failed=0
    
    for dir in "${directories[@]}"; do
        if [[ -d "$dir" ]]; then
            create_backup "$dir" || ((failed++))
        else
            log "WARN" "Directory $dir does not exist, skipping"
        fi
    done
    
    cleanup_old
    
    if [[ $failed -eq 0 ]]; then
        log "INFO" "All backups completed successfully"
        echo -e "${GREEN}Backup completed!${NC}"
    else
        log "ERROR" "$failed backup(s) failed"
        echo -e "${RED}Some backups failed!${NC}"
        exit 1
    fi
}

# Run main
main "$@"
```

---

## 10. Security Hardening

### SSH Security

```bash
# /etc/ssh/sshd_config modifications:

# Change default port
Port 2222

# Disable root login
PermitRootLogin no

# Disable password authentication (use keys only)
PasswordAuthentication no
PubkeyAuthentication yes

# Limit users
AllowUsers user1 user2
AllowGroups sshusers

# Idle timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# SSH key setup
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id user@server
```

### User Security

```bash
# Password policies (/etc/login.defs)
PASS_MAX_DAYS   90
PASS_MIN_DAYS   7
PASS_MIN_LEN    12
PASS_WARN_AGE   14

# PAM password quality (/etc/pam.d/common-password)
password requisite pam_pwquality.so retry=3 minlen=12 difok=3

# Lock inactive accounts
useradd -f 30 username

# Sudo configuration (/etc/sudoers.d/users)
username ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
%devops ALL=(ALL) ALL
```

### Automatic Updates

```bash
# Debian/Ubuntu
apt install unattended-upgrades
dpkg-reconfigure unattended-upgrades

# RHEL/CentOS
dnf install dnf-automatic
systemctl enable --now dnf-automatic.timer
```

---

## 11. Performance Monitoring

### System Monitoring Tools

```bash
# Real-time monitoring
top                         # Process monitor
htop                        # Enhanced process monitor
atop                        # Advanced system monitor
glances                     # System overview
dstat                       # Versatile resource stats

# Memory
free -h                     # Memory summary
vmstat 1                    # Virtual memory stats
sar -r 1 10                 # Memory history

# CPU
mpstat 1                    # CPU statistics
sar -u 1 10                 # CPU history

# Disk I/O
iostat -x 1                 # Disk I/O stats
iotop                       # I/O by process

# Network
iftop                       # Network traffic by connection
nethogs                     # Network by process
sar -n DEV 1                # Network interface stats
```

### Performance Analysis

```bash
# Stress testing
stress --cpu 4 --timeout 60s    # CPU stress
stress --vm 2 --vm-bytes 1G     # Memory stress

# Benchmarking
dd if=/dev/zero of=test bs=1G count=1 oflag=dsync  # Disk write
hdparm -Tt /dev/sda             # Disk read speed

# Profiling
strace -p PID                   # Trace system calls
perf top                        # Performance counters
perf record command             # Record performance
perf report                     # Analyze recording
```

---

## 12. Log Management

### Important Log Files

```bash
# System logs
/var/log/syslog            # General system log (Debian)
/var/log/messages          # General system log (RHEL)
/var/log/auth.log          # Authentication log (Debian)
/var/log/secure            # Authentication log (RHEL)
/var/log/kern.log          # Kernel log
/var/log/dmesg             # Boot messages

# Application logs
/var/log/nginx/            # Nginx logs
/var/log/apache2/          # Apache logs
/var/log/mysql/            # MySQL logs

# Viewing logs
tail -f /var/log/syslog    # Follow log
less /var/log/auth.log     # Page through log
grep "error" /var/log/syslog  # Search log
zcat /var/log/syslog.1.gz  # View compressed log
```

### Log Rotation

```bash
# /etc/logrotate.d/myapp
/var/log/myapp/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload myapp
    endscript
}

# Test logrotate
logrotate -d /etc/logrotate.d/myapp
logrotate -f /etc/logrotate.d/myapp
```

### Centralized Logging

```bash
# rsyslog configuration (/etc/rsyslog.d/50-remote.conf)
# Send to remote server
*.* @logserver.example.com:514    # UDP
*.* @@logserver.example.com:514   # TCP

# Receive from remote
$ModLoad imudp
$UDPServerRun 514
$ModLoad imtcp
$InputTCPServerRun 514
```

---

## Quick Reference Card

```bash
# === ESSENTIAL COMMANDS ===

# Files
ls -la | head | tail | cat | less | grep | find | chmod | chown

# Processes
ps aux | top | htop | kill | pkill | jobs | bg | fg

# Networking
ip addr | ss -tuln | ping | curl | dig | traceroute

# System
systemctl | journalctl | df -h | free -h | uptime

# Users
useradd | usermod | passwd | groups | sudo

# Packages
apt update && apt upgrade | dnf update

# === KEYBOARD SHORTCUTS ===
Ctrl+C    # Cancel command
Ctrl+Z    # Suspend command
Ctrl+D    # Exit shell
Ctrl+L    # Clear screen
Ctrl+R    # Search history
Ctrl+A    # Beginning of line
Ctrl+E    # End of line
Tab       # Autocomplete
```

---

*This guide covers essential Linux administration for DevOps. Continue to the Docker guide for containerization.*
