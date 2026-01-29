# 🔐 SSH Security & Configuration

Master SSH for secure remote access.

## 🎯 Learning Objectives
- Generate and manage SSH keys
- Configure SSH server securely
- Set up SSH tunneling
- Manage multiple hosts with SSH config

---

## Lab 1: SSH Key Management

### Generate Keys
```bash
# Generate RSA key (4096 bits)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Generate Ed25519 (modern, recommended)
ssh-keygen -t ed25519 -C "your_email@example.com"

# With custom name
ssh-keygen -t ed25519 -f ~/.ssh/myserver_key

# View public key
cat ~/.ssh/id_ed25519.pub
```

### Copy Key to Server
```bash
# Using ssh-copy-id
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server

# Manual copy
cat ~/.ssh/id_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### SSH Agent
```bash
# Start agent
eval "$(ssh-agent -s)"

# Add key
ssh-add ~/.ssh/id_ed25519

# List keys
ssh-add -l

# Add to ~/.bashrc for persistence
if [ -z "$SSH_AUTH_SOCK" ]; then
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
fi
```

---

## Lab 2: SSH Config File

### Client Config
```bash
# ~/.ssh/config
Host *
    AddKeysToAgent yes
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

Host dev
    HostName dev.example.com
    User developer
    IdentityFile ~/.ssh/dev_key
    Port 22

Host prod
    HostName prod.example.com
    User admin
    IdentityFile ~/.ssh/prod_key
    Port 2222
    ProxyJump bastion

Host bastion
    HostName bastion.example.com
    User jump
    IdentityFile ~/.ssh/bastion_key

Host *.internal
    ProxyJump bastion
    User admin
```

### Usage
```bash
ssh dev          # Connects to dev.example.com
ssh prod         # Connects via bastion
scp file.txt dev:~/
```

---

## Lab 3: Secure SSH Server

### Hardened sshd_config
```bash
# /etc/ssh/sshd_config

# Disable root login
PermitRootLogin no

# Disable password auth
PasswordAuthentication no
ChallengeResponseAuthentication no

# Key-based only
PubkeyAuthentication yes

# Protocol 2 only
Protocol 2

# Limit users
AllowUsers admin deploy

# Change port (optional)
Port 2222

# Idle timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Disable X11 forwarding
X11Forwarding no

# Disable agent forwarding
AllowAgentForwarding no

# Logging
LogLevel VERBOSE
```

### Apply Changes
```bash
# Validate config
sudo sshd -t

# Restart
sudo systemctl restart sshd
```

---

## Lab 4: SSH Tunneling

### Local Port Forward
```bash
# Access remote service locally
# Local:8080 -> Remote DB:5432
ssh -L 8080:localhost:5432 user@dbserver

# Access internal service via jump
ssh -L 8080:internal-app:80 user@bastion
```

### Remote Port Forward
```bash
# Expose local service to remote
ssh -R 8080:localhost:3000 user@server
```

### Dynamic Proxy (SOCKS)
```bash
# Create SOCKS proxy
ssh -D 1080 user@server

# Use with browser or curl
curl --socks5 localhost:1080 http://internal-site
```

---

## ✅ Completion Checklist
- [ ] Generated SSH key pair
- [ ] Configured SSH client (~/.ssh/config)
- [ ] Hardened SSH server
- [ ] Set up SSH tunneling
- [ ] Tested key-based authentication
