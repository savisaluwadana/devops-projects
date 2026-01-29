# 🐧 Linux Administration Essentials

Master Linux fundamentals for DevOps - the foundation of everything.

## 🎯 Learning Objectives

- Navigate the Linux filesystem confidently
- Manage users, groups, and permissions
- Monitor and control processes
- Configure basic networking
- Automate with package managers

## 📋 Prerequisites

- Access to a Linux system (VM, WSL2, or native)
- Basic terminal familiarity

## 🔬 Hands-On Labs

### Lab 1: Filesystem Navigation
```bash
# Create project structure
mkdir -p ~/devops-lab/{configs,scripts,logs}
cd ~/devops-lab

# Explore system directories
ls -la /etc
cat /etc/os-release
df -h
du -sh /var/log
```

### Lab 2: User & Permission Management
```bash
# Create a devops user
sudo useradd -m -s /bin/bash devops
sudo passwd devops

# Manage permissions
chmod 755 scripts/
chown -R devops:devops ~/devops-lab
ls -la

# Understand umask
umask
umask 022
```

### Lab 3: Process Management
```bash
# View processes
ps aux | head -20
top -b -n1
htop

# Background processes
sleep 300 &
jobs
fg %1
kill %1

# System services
systemctl status sshd
systemctl list-units --type=service
```

### Lab 4: Networking Basics
```bash
# Network configuration
ip addr show
ip route show

# Connectivity testing
ping -c 4 8.8.8.8
curl -I https://example.com
dig google.com

# Port scanning
ss -tuln
netstat -tlnp
```

### Lab 5: Package Management
```bash
# Debian/Ubuntu
sudo apt update
sudo apt install -y nginx
apt search vim
apt show nginx

# RHEL/CentOS
sudo dnf update
sudo dnf install -y httpd
dnf search vim
```

## 📝 Project: System Setup Script

Create an automated system setup script:

```bash
#!/bin/bash
# setup-devops-vm.sh

set -e

echo "Starting DevOps VM Setup..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
PACKAGES="git vim curl wget htop tree jq unzip"
sudo apt install -y $PACKAGES

# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Create dev directories
mkdir -p ~/projects/{docker,k8s,terraform}

echo "Setup complete! Please logout and login for Docker group changes."
```

## ✅ Completion Checklist

- [ ] Navigate filesystem with confidence
- [ ] Create users and manage permissions
- [ ] Monitor and kill processes
- [ ] Check network connectivity
- [ ] Install packages with apt/dnf
- [ ] Create automated setup script

## 📚 Resources

- [Linux Journey](https://linuxjourney.com/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [The Linux Command Line Book](https://linuxcommand.org/tlcl.php)

---

**Next Project:** [Shell Scripting for DevOps](../shell-scripting/)
