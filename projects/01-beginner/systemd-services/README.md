# ⚙️ Systemd Service Management

Learn to create and manage system services with systemd.

## 🎯 Learning Objectives
- Understand systemd architecture
- Create custom services
- Manage service lifecycle
- Configure timers (cron replacement)
- Debug service issues

---

## Lab 1: Service Basics

### Service Commands
```bash
# Status
systemctl status nginx
systemctl is-active nginx
systemctl is-enabled nginx

# Control
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

# Enable/Disable
sudo systemctl enable nginx
sudo systemctl disable nginx

# List services
systemctl list-units --type=service
systemctl list-units --type=service --state=running
systemctl list-unit-files --type=service
```

---

## Lab 2: Create Custom Service

### Simple Service
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
ExecStart=/opt/myapp/bin/myapp
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Enable Service
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable and start
sudo systemctl enable myapp
sudo systemctl start myapp

# Check status
systemctl status myapp
journalctl -u myapp -f
```

### Node.js Service Example
```ini
# /etc/systemd/system/nodeapp.service
[Unit]
Description=Node.js Application
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/nodeapp
ExecStart=/usr/bin/node /opt/nodeapp/server.js
Environment=NODE_ENV=production
Environment=PORT=3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## Lab 3: Systemd Timers

### Timer Unit
```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Run backup daily

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
```

### Service for Timer
```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Backup Service

[Service]
Type=oneshot
ExecStart=/opt/scripts/backup.sh
```

### Manage Timer
```bash
sudo systemctl enable backup.timer
sudo systemctl start backup.timer
systemctl list-timers
```

---

## Lab 4: Debugging

### Logs
```bash
# View logs
journalctl -u myapp
journalctl -u myapp -f              # Follow
journalctl -u myapp --since today
journalctl -u myapp -n 100          # Last 100 lines
journalctl -u myapp -p err          # Only errors

# System boot
journalctl -b                       # Current boot
journalctl --list-boots
```

### Common Issues
```bash
# Check syntax
systemd-analyze verify myapp.service

# Show dependencies
systemctl list-dependencies myapp

# Check failed services
systemctl --failed
```

---

## ✅ Completion Checklist
- [ ] Managed existing services
- [ ] Created custom service
- [ ] Configured service restart
- [ ] Created timer (cron replacement)
- [ ] Debugged service issues with journalctl
